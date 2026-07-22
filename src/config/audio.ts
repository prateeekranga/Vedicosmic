/**
 * ════════════════════════════════════════════════════════════════════
 *  VediCosmic — AUDIO CONFIG.  Edit this file to change the music/voice.
 * ════════════════════════════════════════════════════════════════════
 *
 * Two ways to provide audio:
 *   1) mode: 'generative'  → a built-in, file-free spiritual soundscape
 *                            (works everywhere, incl. the single-file build).
 *   2) mode: 'file'        → YOUR OWN track. Put the file in  public/audio/
 *                            and set fileUrl, e.g. '/audio/ambient.mp3'.
 *                            (Use this on the deployed/Vercel site; the
 *                             single-file HTML can't inline a runtime file.)
 *
 * To swap the generative mood, change `preset` to 'temple' | 'cosmos' | 'river'.
 */
export const audioConfig = {
  background: {
    enabled: true,                 // play ambient music across the site
    mode: 'generative' as 'generative' | 'file',
    preset: 'temple' as 'temple' | 'cosmos' | 'river',
    fileUrl: '',                   // e.g. '/audio/ambient.mp3'
    volume: 0.5,                   // 0–1
  },

  tratak: {
    mode: 'generative' as 'generative' | 'file',
    fileUrl: '',                   // e.g. '/audio/tratak.mp3'
    volume: 0.52,

    // Spoken guidance during the Trataka session (English + Hindi).
    voice: {
      enabled: true,
      mode: 'tts' as 'tts' | 'file',   // 'tts' = browser voice (file-free)
      lang: 'en' as 'en' | 'hi',       // default guided-voice language (user can switch in the tool)
      // If mode: 'file', provide recorded clips instead of the TTS lines:
      files: { start: '', mid: '', end: '' },  // e.g. '/audio/tratak-intro.mp3'
      rate: 0.82,
      pitch: 0.9,
      lines: {
        en: {
          start: 'Welcome. Settle into a comfortable, upright seat. Soften your gaze and rest it gently on the light. Let your breath slow, and try not to blink.',
          settle: 'Let your shoulders drop. Breathe slowly through the nose. Let the whole body grow still, and keep only the light in your awareness.',
          mid: 'Stay with the light. If your eyes begin to water, that is perfectly alright. Keep your gaze soft, and your spine tall.',
          nearEnd: 'Just a little longer. Hold the light steady at the centre of your vision — calm, and unwavering.',
          end: 'Gently close your eyes now. Watch the glowing afterimage drift to the centre of your brow, and simply rest there until it fades.',
          reminders: [
            'Soften the forehead. Let the gaze be effortless.',
            'You are the still witness. Simply watch the light.',
            'Release any tension around the eyes and jaw.',
            'Let thoughts pass like clouds, and return to the light.',
            'Sink a little deeper into stillness.',
          ],
        },
        hi: {
          start: 'स्वागत है। आराम से, सीधी रीढ़ के साथ बैठ जाइए। अपनी दृष्टि को कोमल बनाकर धीरे से प्रकाश पर टिकाइए। साँस को धीमा होने दीजिए, और पलक झपकाने की कोशिश मत कीजिए।',
          settle: 'अपने कंधों को ढीला छोड़ दीजिए। नाक से धीरे-धीरे साँस लीजिए। पूरे शरीर को स्थिर होने दीजिए, और केवल प्रकाश को अपने ध्यान में रखिए।',
          mid: 'प्रकाश के साथ बने रहिए। यदि आँखों से पानी आने लगे तो यह पूरी तरह ठीक है। दृष्टि कोमल रखिए, और रीढ़ सीधी।',
          nearEnd: 'बस थोड़ी देर और। प्रकाश को अपनी दृष्टि के केंद्र में शांत और स्थिर बनाए रखिए।',
          end: 'अब धीरे से अपनी आँखें बंद कर लीजिए। भ्रूमध्य में तैरते हुए चमकते प्रतिबिम्ब को देखिए, और जब तक वह विलीन न हो जाए, वहीं विश्राम कीजिए।',
          reminders: [
            'माथे को शिथिल कीजिए। दृष्टि को सहज रहने दीजिए।',
            'आप स्थिर साक्षी हैं। बस प्रकाश को देखते रहिए।',
            'आँखों और जबड़े के आसपास का तनाव छोड़ दीजिए।',
            'विचारों को बादलों की तरह जाने दीजिए, और प्रकाश पर लौट आइए।',
            'स्थिरता में थोड़ा और गहरे उतर जाइए।',
          ],
        },
      },
    },
  },
};
