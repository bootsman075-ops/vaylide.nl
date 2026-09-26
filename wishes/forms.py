from django import forms

from .models import CustomRequest


class WishForm(forms.Form):
    invitation = forms.ChoiceField(label="Over welke uitnodiging gaat het?", required=False)
    subject = forms.CharField(label="Onderwerp", max_length=140,
                              error_messages={"required": "Geef je vraag een kort onderwerp."})
    description = forms.CharField(
        label="Beschrijf je wens of vraag",
        max_length=4000,
        widget=forms.Textarea(attrs={"rows": 7}),
        error_messages={"required": "Beschrijf je wens of vraag."},
        help_text="Hoe concreter, hoe beter we je kunnen helpen. Voeg gerust een voorbeeld toe.",
    )
    attachment = forms.FileField(
        label="Voorbeeldbestand (optioneel)",
        required=False,
        help_text="PDF, JPG, PNG of WebP, maximaal 10 MB.",
        widget=forms.ClearableFileInput(attrs={"accept": "application/pdf,image/jpeg,image/png,image/webp"}),
    )

    def __init__(self, *args, invitations=(), **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["invitation"].choices = [("", "Geen specifieke uitnodiging")] + [
            (str(inv.uid), inv.title or f"Uitnodiging ({inv.get_occasion_display()})") for inv in invitations
        ]

    def clean_description(self):
        text = self.cleaned_data["description"].strip()
        if len(text) < 10:
            raise forms.ValidationError("Beschrijf je wens iets uitgebreider.")
        return text


class MessageForm(forms.Form):
    body = forms.CharField(label="Je bericht", max_length=4000, required=False, widget=forms.Textarea(attrs={"rows": 4}))
    attachment = forms.FileField(label="Bestand (optioneel)", required=False,
                                 widget=forms.ClearableFileInput(attrs={"accept": "application/pdf,image/jpeg,image/png,image/webp"}))


class StaffMessageForm(MessageForm):
    internal = forms.BooleanField(label="Interne notitie (niet zichtbaar voor de klant)", required=False)


class ProposalForm(forms.Form):
    text = forms.CharField(label="Voorstel aan de klant", max_length=4000, widget=forms.Textarea(attrs={"rows": 6}))
    price = forms.DecimalField(label="Prijs in euro's (leeg of 0 = geen meerprijs)", required=False, min_value=0,
                               max_digits=8, decimal_places=2)

    def price_cents(self):
        price = self.cleaned_data.get("price")
        return int(round(price * 100)) if price else None


class StatusForm(forms.Form):
    status = forms.ChoiceField(label="Nieuwe status", choices=CustomRequest.Status.choices)
    note = forms.CharField(label="Toelichting aan de klant (optioneel)", required=False, max_length=1000,
                           widget=forms.Textarea(attrs={"rows": 2}))
