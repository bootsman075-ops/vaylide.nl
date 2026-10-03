"""Instagram Reel (tools/reel): een kloppende tijdlijn en het logo zoals aangeleverd."""
import hashlib
import json

from django.conf import settings
from django.test import SimpleTestCase

REEL = settings.BASE_DIR / "tools" / "reel"


class ReelTimingTests(SimpleTestCase):
    def setUp(self):
        self.timing = json.loads((REEL / "src" / "timing.json").read_text(encoding="utf-8"))

    def test_scenes_follow_each_other_and_last_about_five_and_a_half_seconds(self):
        scenes = [self.timing[f"scene{i}"] for i in range(1, 5)]
        self.assertEqual(scenes[0]["start"], 0)
        for prev, nxt in zip(scenes, scenes[1:]):
            self.assertEqual(prev["end"], nxt["start"])
        self.assertAlmostEqual(scenes[-1]["end"], 5.5, delta=0.5)

    def test_every_animation_runs_forward_within_the_reel(self):
        end = self.timing["scene4"]["end"]
        for name, part in self.timing.items():
            if name == "sound":
                for moment in part.values():
                    self.assertTrue(0 <= moment <= end, name)
                continue
            times = list(part.values())
            self.assertEqual(times, sorted(times), name)
            self.assertTrue(all(0 <= t <= end for t in times), name)

    def test_scenes_keep_the_requested_order(self):
        t = self.timing
        self.assertLess(t["sealLoosen"]["start"], t["flapOpen"]["start"])
        self.assertLessEqual(t["flapOpen"]["end"], t["cardRise"]["start"] + 0.1)
        self.assertLess(t["cardRise"]["start"], t["cardToPhone"]["start"])
        self.assertLessEqual(t["phoneExit"]["start"], t["logoIn"]["start"])
        # rustig uitfaden in de laatste 0,3 seconde
        self.assertAlmostEqual(t["fadeOut"]["end"] - t["fadeOut"]["start"], 0.3, places=2)
        self.assertEqual(t["fadeOut"]["end"], t["scene4"]["end"])


class ReelLogoTests(SimpleTestCase):
    def test_logo_is_the_delivered_logo(self):
        # Vaste regel 12: het logo wordt gebruikt zoals aangeleverd, niet hertekend of bijgesneden.
        delivered = settings.BASE_DIR / "tools" / "logo" / "vaylide-logo-vrijstaand.png"
        used = REEL / "public" / "vaylide-logo.png"
        digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()  # noqa: E731
        self.assertEqual(digest(used), digest(delivered))

    def test_texts_are_the_requested_lines(self):
        config = (REEL / "src" / "config.ts").read_text(encoding="utf-8")
        for line in ("Bijzondere momenten beginnen hier.", "Maak jouw moment bijzonder.", "vaylide.nl"):
            self.assertIn(line, config)
