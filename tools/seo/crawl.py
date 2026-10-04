"""Eigen SEO-crawler: loopt via de Django-testclient langs alle interne links en meldt titel, beschrijving,
koppen, canonical, afbeeldingen zonder alt, JSON-LD en kapotte links. Gebruik: .venv/bin/python tools/seo/crawl.py"""
import os, sys, re, collections
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django; django.setup()
from django.conf import settings
settings.ALLOWED_HOSTS = ["*"]
from django.test import Client
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.links=[]; s.title=""; s.in_title=False; s.meta={}; s.canon=None; s.h1=0; s.imgs_noalt=0; s.imgs=0; s.ld=0; s.lang=None; s.heads=[]; s._h=None
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=="html": s.lang=a.get("lang")
        if t=="title": s.in_title=True
        if t=="meta":
            k=a.get("name") or a.get("property")
            if k: s.meta[k]=a.get("content","")
        if t=="link" and a.get("rel")=="canonical": s.canon=a.get("href")
        if t=="a" and a.get("href"): s.links.append(a["href"])
        if t=="h1": s.h1+=1
        if t in("h1","h2","h3"): s._h=t; s.heads.append(t)
        if t=="img":
            s.imgs+=1
            if "alt" not in a: s.imgs_noalt+=1
        if t=="script" and a.get("type")=="application/ld+json": s.ld+=1
    def handle_endtag(s,t):
        if t=="title": s.in_title=False
    def handle_data(s,d):
        if s.in_title: s.title+=d

c=Client(HTTP_HOST="testserver")
seen={}; queue=["/"]
while queue:
    u=queue.pop(0)
    if u in seen: continue
    r=c.get(u, follow=False)
    seen[u]=r
    if r.status_code==200 and "text/html" in r["Content-Type"]:
        p=P(); p.feed(r.content.decode())
        r.p=p
        for l in p.links:
            l=l.split("#")[0]
            if l.startswith("/") and not l.startswith("//") and not l.startswith(("/static","/media")):
                if l not in seen: queue.append(l)
    elif r.status_code in (301,302):
        queue.append(r["Location"].replace("http://testserver",""))
print("Gecrawld:",len(seen))
titles=collections.defaultdict(list); descs=collections.defaultdict(list)
for u,r in sorted(seen.items()):
    p=getattr(r,"p",None)
    if r.status_code!=200:
        print(f"[{r.status_code}] {u} -> {r.get('Location','')}"); continue
    if not p: continue
    issues=[]
    t=p.title.strip(); d=p.meta.get("description","")
    if not t: issues.append("geen title")
    elif len(t)>60: issues.append(f"title {len(t)} tekens")
    elif len(t)<20: issues.append(f"title kort {len(t)}")
    if not d: issues.append("geen description")
    elif len(d)>160: issues.append(f"desc {len(d)}")
    elif len(d)<70: issues.append(f"desc kort {len(d)}")
    if p.h1!=1: issues.append(f"h1={p.h1}")
    if not p.canon: issues.append("geen canonical")
    if p.imgs_noalt: issues.append(f"{p.imgs_noalt}/{p.imgs} img zonder alt")
    if not p.ld: issues.append("geen JSON-LD")
    if "og:url" not in p.meta: issues.append("geen og:url")
    if "twitter:card" not in p.meta: issues.append("geen twitter:card")
    rb=p.meta.get("robots") or r.get("X-Robots-Tag","")
    titles[t].append(u); descs[d].append(u)
    print(f"{u} | robots={rb or '-'} | {t!r} | "+("; ".join(issues) or "ok"))
print("\nDubbele titles:",{k:v for k,v in titles.items() if len(v)>1})
print("Dubbele descriptions:",{k[:50]:v for k,v in descs.items() if len(v)>1 and k})
