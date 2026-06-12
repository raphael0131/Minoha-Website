/*  characters.js
    Pixel-art couple SVG injected into any element with data-char="couple"
    Boy  = blue shirt, dark hair
    Girl = pink dress, dark hair
    Hearts + stars floating between them

    HOW TO EDIT:
    - Change fill colours to match your gf's outfit / hair colour
    - The SVG uses a 130×85 grid of pixel rectangles (each <rect>)
    - Boy  starts at x=2,  Girl starts at x=66
    - Hearts/stars are at the top centre                            */

const CHARS = {
  couple: `<svg
    viewBox="0 0 130 85"
    xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:420px;image-rendering:pixelated"
    shape-rendering="crispEdges">

    <!-- ═══════════════════════════════
         BOY  (left side, x 2–44)
    ═══════════════════════════════ -->

    <!-- hair -->
    <rect x="4"  y="4"  width="36" height="14" fill="#2C1A0A"/>
    <rect x="2"  y="8"  width="40" height="10" fill="#2C1A0A"/>

    <!-- face -->
    <rect x="6"  y="16" width="28" height="22" fill="#FFDBB5"/>

    <!-- eyes -->
    <rect x="11" y="22" width="4"  height="4"  fill="#2C1810"/>
    <rect x="25" y="22" width="4"  height="4"  fill="#2C1810"/>
    <!-- eye shine -->
    <rect x="11" y="22" width="2"  height="2"  fill="#FFFFFF"/>
    <rect x="25" y="22" width="2"  height="2"  fill="#FFFFFF"/>

    <!-- mouth -->
    <rect x="14" y="32" width="10" height="2"  fill="#C06A50"/>

    <!-- neck -->
    <rect x="16" y="38" width="8"  height="4"  fill="#FFDBB5"/>

    <!-- shirt (blue) -->
    <rect x="4"  y="42" width="32" height="20" fill="#85C1FF"/>

    <!-- left arm -->
    <rect x="0"  y="42" width="6"  height="18" fill="#85C1FF"/>
    <rect x="0"  y="58" width="6"  height="4"  fill="#FFDBB5"/>

    <!-- right arm reaching toward girl -->
    <rect x="34" y="48" width="8"  height="4"  fill="#FFDBB5"/>

    <!-- pants -->
    <rect x="10" y="62" width="8"  height="8"  fill="#3A3A5A"/>
    <rect x="22" y="62" width="8"  height="8"  fill="#3A3A5A"/>
    <!-- shoes -->
    <rect x="8"  y="68" width="12" height="4"  fill="#1A1A2A"/>
    <rect x="20" y="68" width="12" height="4"  fill="#1A1A2A"/>


    <!-- ═══════════════════════════════
         GIRL  (right side, x 62–106)
    ═══════════════════════════════ -->

    <!-- hair (long, covers sides) -->
    <rect x="66" y="6"  width="36" height="10" fill="#4A2C0A"/>
    <rect x="68" y="12" width="36" height="42" fill="#4A2C0A"/>
    <rect x="66" y="16" width="6"  height="38" fill="#4A2C0A"/>
    <rect x="98" y="16" width="6"  height="38" fill="#4A2C0A"/>

    <!-- face -->
    <rect x="70" y="8"  width="28" height="22" fill="#FFDBB5"/>

    <!-- eyes -->
    <rect x="72" y="18" width="4"  height="4"  fill="#2C1810"/>
    <rect x="90" y="18" width="4"  height="4"  fill="#2C1810"/>
    <!-- eye shine -->
    <rect x="72" y="18" width="2"  height="2"  fill="#FFFFFF"/>
    <rect x="90" y="18" width="2"  height="2"  fill="#FFFFFF"/>

    <!-- blush -->
    <rect x="70" y="24" width="4"  height="2"  fill="#FFB0B0" opacity="0.7"/>
    <rect x="92" y="24" width="4"  height="2"  fill="#FFB0B0" opacity="0.7"/>

    <!-- mouth (smile) -->
    <rect x="76" y="26" width="12" height="2"  fill="#E8756A"/>

    <!-- neck -->
    <rect x="76" y="32" width="12" height="4"  fill="#FFDBB5"/>

    <!-- dress body (pink) -->
    <rect x="68" y="36" width="32" height="22" fill="#FF85A1"/>
    <!-- dress collar / bow -->
    <rect x="76" y="36" width="16" height="4"  fill="#FFFFFF"/>

    <!-- dress skirt (wider) -->
    <rect x="62" y="58" width="44" height="10" fill="#FF85A1"/>

    <!-- left arm reaching toward boy -->
    <rect x="62" y="44" width="8"  height="4"  fill="#FFDBB5"/>

    <!-- right arm -->
    <rect x="98" y="42" width="8"  height="16" fill="#FFDBB5"/>

    <!-- legs -->
    <rect x="72" y="68" width="10" height="8"  fill="#FFDBB5"/>
    <rect x="86" y="68" width="10" height="8"  fill="#FFDBB5"/>
    <!-- shoes -->
    <rect x="70" y="74" width="12" height="4"  fill="#4A2C0A"/>
    <rect x="84" y="74" width="12" height="4"  fill="#4A2C0A"/>


    <!-- ═══════════════════════════════
         HOLDING HANDS  (x 42–62)
    ═══════════════════════════════ -->
    <rect x="42" y="46" width="10" height="6"  fill="#FFDBB5"/>
    <rect x="52" y="46" width="10" height="6"  fill="#FFDBB5"/>
    <!-- interlock pixel -->
    <rect x="46" y="44" width="2"  height="10" fill="#FFB8C8"/>


    <!-- ═══════════════════════════════
         FLOATING HEART  (top centre)
    ═══════════════════════════════ -->
    <!-- heart shape built from rects -->
    <rect x="54" y="2"  width="4"  height="4"  fill="#FF85A1"/>
    <rect x="58" y="2"  width="4"  height="4"  fill="#FF85A1"/>
    <rect x="52" y="4"  width="14" height="4"  fill="#FF85A1"/>
    <rect x="54" y="8"  width="10" height="4"  fill="#FF85A1"/>
    <rect x="56" y="12" width="6"  height="4"  fill="#FF85A1"/>
    <rect x="58" y="16" width="2"  height="2"  fill="#FF85A1"/>

    <!-- ═══════════════════════════════
         PIXEL STARS
    ═══════════════════════════════ -->
    <!-- star left (yellow) -->
    <rect x="44" y="0"  width="2"  height="6"  fill="#FFE44D"/>
    <rect x="41" y="3"  width="8"  height="2"  fill="#FFE44D"/>

    <!-- star right (blue) -->
    <rect x="72" y="0"  width="2"  height="6"  fill="#85C1FF"/>
    <rect x="69" y="3"  width="8"  height="2"  fill="#85C1FF"/>

    <!-- small sparkle dots -->
    <rect x="48" y="14" width="2"  height="2"  fill="#FFE44D" opacity="0.8"/>
    <rect x="78" y="12" width="2"  height="2"  fill="#C4A0FF" opacity="0.8"/>
    <rect x="38" y="10" width="2"  height="2"  fill="#FF85A1" opacity="0.8"/>

  </svg>`
};