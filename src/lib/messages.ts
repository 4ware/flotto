// German UI texts, copied from the flot.to web app (messages/de.json) so both apps read the same.
// The API answers errors with keys such as "Errors.wrongCredentials"; see translateMessageKey.

export const messages = {
  "Errors": {
    "generic": "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.",
    "tooManyRequests": "Zu viele Versuche. Bitte warten Sie einen Moment.",
    "loginRequired": "Bitte melden Sie sich an.",
    "loggedOut": "Bitte melden Sie sich erneut an.",
    "notAllowed": "Dazu fehlt Ihnen die Berechtigung.",
    "wrongCredentials": "E-Mail-Adresse oder Passwort ist falsch.",
    "emailNotVerified": "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Wir haben Ihnen einen neuen Link gesendet.",
    "resetLinkInvalid": "Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
    "emailTaken": "Diese E-Mail-Adresse ist bereits registriert.",
    "sameEmail": "Das ist bereits Ihre E-Mail-Adresse.",
    "wrongPassword": "Das aktuelle Passwort ist falsch.",
    "alreadyMember": "Diese Person gehört bereits zum Team.",
    "alreadyInvited": "Diese Person wurde bereits eingeladen.",
    "onlyOwner": "Der einzige Inhaber kann nicht entfernt werden.",
    "ownerRequired": "Das Team braucht mindestens einen Inhaber.",
    "otherRecipient": "Diese Einladung gilt für eine andere E-Mail-Adresse.",
    "invitationInvalid": "Diese Einladung ist ungültig oder abgelaufen.",
    "emailRequired": "Bitte geben Sie Ihre E-Mail-Adresse ein.",
    "accountExists": "Für diese E-Mail-Adresse gibt es bereits ein Konto.",
    "customerNotFound": "Dieser Kunde wurde nicht gefunden.",
    "customerHasTours": "Dieser Kunde hat noch Touren und kann nicht gelöscht werden.",
    "tourNotFound": "Diese Tour wurde nicht gefunden.",
    "unknownReference": "Kunde oder Fahrzeug wurde nicht gefunden.",
    "licensePlateTaken": "Dieses Kennzeichen ist bereits angelegt.",
    "vehicleNotFound": "Dieses Fahrzeug wurde nicht gefunden.",
    "vehicleHasTours": "Dieses Fahrzeug hat noch Touren und kann nicht gelöscht werden.",
    "maintenanceNotFound": "Dieser Eintrag wurde nicht gefunden.",
    "uploadsUnavailable": "Fotos können gerade nicht hochgeladen werden.",
    "fuelEntryNotFound": "Dieser Tankvorgang wurde nicht gefunden.",
    "certificationNotFound": "Dieses Zertifikat wurde nicht gefunden.",
    "memberNotFound": "Dieses Teammitglied wurde nicht gefunden.",
    "roleNotAllowed": "Fahrer können keine Administratoren sein."
  },
  "Validation": {
    "emailInvalid": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    "passwordRequired": "Bitte geben Sie Ihr Passwort ein."
  },
  "Common": {
    "email": "E-Mail-Adresse",
    "password": "Passwort",
    "emailPlaceholder": "name@unternehmen.de",
    "logout": "Abmelden",
    "loading": "Wird geladen"
  },
  "Auth": {
    "showPassword": "Passwort anzeigen",
    "hidePassword": "Passwort verbergen",
    "login": {
      "title": "Willkommen zurück",
      "description": "Melden Sie sich bei Ihrem flot.to-Konto an.",
      "footerText": "Noch kein Konto?",
      "footerLink": "Jetzt registrieren",
      "forgotPassword": "Passwort vergessen?",
      "submit": "Anmelden"
    }
  },
  "Vehicles": {
    "fleet": "Fuhrpark",
    "empty": "Noch keine Fahrzeuge angelegt.",
    "mileage": "Kilometerstand"
  },
  "Tours": {
    "statuses": {
      "pending": "Ausstehend",
      "started": "Gestartet",
      "complete": "Abgeschlossen"
    }
  },
  "Roles": {
    "owner": "Inhaber",
    "admin": "Administrator",
    "employee": "Mitarbeiter",
    "driver": "Fahrer"
  }
} as const;

type ErrorKey = keyof typeof messages.Errors;

/** Turn an API message key ("Errors.wrongCredentials") into its German text. */
export function translateMessageKey(key: string | undefined): string {
  const name = key?.startsWith("Errors.") ? key.slice("Errors.".length) : undefined;
  if (name && name in messages.Errors) return messages.Errors[name as ErrorKey];
  return messages.Errors.generic;
}
