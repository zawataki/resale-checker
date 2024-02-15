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
The following shell script opens the resale ticket page when it exists.
```bash
PREV_URL=""
RESALE_PAGE_URL="https://cloak.pia.jp/resale/item/list?eventCd=..."

while true; do
  date

  if curl -si "$RESALE_PAGE_URL" | fgrep 'Location: https://cloak.pia.jp/resale' > /tmp/resale-result; then

    FOUND_URL="$(cat /tmp/resale-result | cut -d' ' -f2 | tr -d '\n\r')"
    echo "URL: $FOUND_URL"
    if [ "$FOUND_URL" != "$PREV_URL" ]; then
      open "$FOUND_URL"
      PREV_URL="$FOUND_URL"
    fi

    say -v Flo 'resale found'
  fi

  sleep 5
done
```
