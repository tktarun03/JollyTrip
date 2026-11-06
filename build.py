#!/usr/bin/env python3
"""Builds index.html from the files in src/.  Run:  python3 build.py"""
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
def r(n): return open(os.path.join(SRC, n), encoding='utf-8').read()
JS = ['a-core.js', 'b-data.js', 'c-views.js', 'd-sheets.js', 'e-events.js', 'f-extra.js', 'g-wallet.js', 'h-maps.js', 'i-backup-cal.js', 'z-start.js']
js = "(function () {\n  'use strict';\n" + ''.join(r(n) for n in JS) + "})();\n"
libs = ('<script>/* js-cookie 3.0.5, MIT */\n' + r('lib-cookie.js').strip() + '\n</script>\n'
        '<script>/* lz-string 1.5.0, MIT */\n' + r('lib-lz.js').strip() + '\n</script>\n'
        '<script>/* qrcode-generator 1.4.4, MIT, Kazuhiko Arase */\n' + r('lib-qr.js').strip() + '\n</script>\n')
head = r('head.html').replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
       '<meta name="theme-color" content="#F4F6F5">\n<meta name="apple-mobile-web-app-capable" content="yes">\n'
       '<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="JollyTrip">\n'
       '<meta name="description" content="JollyTrip: family trip planner, itinerary, bookings, packing list and holiday budget tracker.">\n'
       '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n'
       '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n' + head +
       '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
       '<style>\n' + r('style.css') + '</style>\n</head>\n<body>\n' + r('body.html') + libs + '<script>\n' + js + '</script>\n</body>\n</html>\n')
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(doc)
print('Built index.html,', len(doc), 'bytes')
