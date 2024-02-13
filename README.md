# About
A script to check if a resale ticket exists in the given event of provided by Ticket PIA.

# How to Use
1. Install necessary dependencies
    ```bash
    npm install
    ```

2. Run a script. Usually, it finishes in a few seconds.
    ```bash
    node check-resale.js --url 'https://ticket-PIA-event-URL'
    ```

## If you know a resale page URL
You can check resale info using the URL.
```bash
RESALE_URL="https://cloak.pia.jp/resale/item/list?eventCd=..."

while true; do
  date

  if curl -si "$RESALE_URL" | fgrep 'Location: https://cloak.pia.jp/resale'; then
    say -v Flo 'resale found'
  fi

  sleep 5
done
```
