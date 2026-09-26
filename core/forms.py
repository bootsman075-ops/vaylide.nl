from django import forms

from .models import ContactMessage


class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ["name", "email", "topic", "message"]
        labels = {"name": "Je naam", "email": "Je e-mailadres", "topic": "Waar gaat het over?", "message": "Je bericht"}
        widgets = {
            "name": forms.TextInput(attrs={"autocomplete": "name", "maxlength": 120}),
            "email": forms.EmailInput(attrs={"autocomplete": "email"}),
            "message": forms.Textarea(attrs={"rows": 6, "maxlength": 4000}),
        }
        error_messages = {
            "name": {"required": "Vul je naam in."},
            "email": {"required": "Vul je e-mailadres in.", "invalid": "Vul een geldig e-mailadres in."},
            "message": {"required": "Schrijf je bericht."},
        }

    def clean_message(self):
        message = self.cleaned_data["message"].strip()
        if len(message) < 10:
            raise forms.ValidationError("Je bericht is erg kort. Vertel iets meer, dan kunnen we je goed helpen.")
        return message
