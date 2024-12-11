#!/bin/bash

# IPv4-Adresse aus ifconfig extrahieren
IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')

# Datei erstellen/überschreiben mit der IP
echo "export const IP = '${IP}'" > server/utils/env.ts
