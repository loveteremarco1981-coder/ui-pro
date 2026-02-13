
# Automazione Casa – Livello 2 (UI PRO, OLED)

- Tema OLED, card glass, micro‑interazioni
- Pannello persona (Arrivo/Uscita/LIFE) + Vacanza/Override (PIN)
- Grafico **Presenza ultime 24h** (campionamento 5 minuti)

## Configurazione
Apri `config.js` e imposta:
```js
window.APP_CONFIG = { pin: '1526', endpoint: 'https://script.google.com/macros/s/XXX/exec' };
```

## API richieste
- GET `endpoint` → stato casa (usa il tuo `doGet` esistente)
- GET `endpoint?trend=24h` → `{ trend24h:[{t, present}] }` (vedi snippet GAS)
- POST persone: `persona_arriva|persona_esce|persona_life` + `persona`
- POST admin: `set_vacanza|set_override` + `value` + `pin`
