// Offline Local AI Rule & Intent Engine for GraminAarogya
// Runs 100% in-browser with zero internet connectivity for rural Marathi, Hindi & English queries

export function processOfflineAiQuery(query, lang = 'mr') {
  const q = (query || '').toLowerCase().trim();

  // 1. EMERGENCY: Snakebite / Scorpion
  if (q.includes('snake') || q.includes('साप') || q.includes('सर्प') || q.includes('विंचू') || q.includes('डंख') || q.includes('विष')) {
    return {
      reply: lang === 'mr'
        ? "⚠️ **तातडीचा सर्पदंश प्रथमोपचार (Critical Red Alert):**\n1. रुग्णाला अजिबात हालचाल करू देऊ नका, शांत ठेवा.\n2. चावलेला भाग हृदयाच्या खाली ठेवा आणि लाकडी पट्टीने बांधून स्थिर करा.\n3. **कधीही चीरा मारू नका किंवा घट्ट दोरी बांधू नका!**\n4. त्र्यंबकेश्वर PHC (१८ बाटल्या) व जुन्नर ग्रामीण रुग्णालयात अँटी-व्हेनम उपलब्ध आहे. **तात्काळ १०८ वर कॉल करा!**"
        : lang === 'hi'
        ? "⚠️ **सांप के काटने पर तत्काल प्राथमिक चिकित्सा (Critical Red):**\n1. मरीज को पूरी तरह शांत रखें, हिलने-डुलने न दें।\n2. काटे गए अंग को दिल के स्तर से नीचे रखें और पट्टी से स्थिर करें।\n3. **चीरा न लगाएं और टाइट रस्सी न बांधें!**\n4. तुरंत 108 एम्बुलेंस को कॉल करें।"
        : "⚠️ **Emergency Snakebite Protocol (Critical Red):**\n1. Keep patient calm and completely still.\n2. Immobilize the bitten limb below heart level.\n3. **DO NOT cut, suck, or tie tight tourniquets!**\n4. 18 Anti-venom vials available at Trimbak PHC. Call 108 immediately.",
      intent: 'emergency_snake',
      action: { type: 'call_108', label: '📞 कॉल १०८ रुग्णवाहिका' },
      quickSuggestions: ['अँटी-व्हेनम असलेले रुग्णालय', '१०८ कॉल करा', 'इतर मदत']
    };
  }

  // 2. EMERGENCY: Chest Pain / Cardiac
  if (q.includes('heart') || q.includes('छाती') || q.includes('हृदय') || q.includes('घाम') || q.includes('chest') || q.includes('attack')) {
    return {
      reply: lang === 'mr'
        ? "⚠️ **हृदयविकार झटका शक्यता (Cardiac Alert):**\n1. रुग्णाला ४५ अंशाच्या कोनात टेकून बसवा (Semi-sitting).\n2. डॉक्टरांच्या सल्ल्यानुसार Sorbitrate 5mg जिभेखाली किंवा Aspirin 300mg चावून द्या.\n3. रुग्णाला अजिबात चालवू नका.\n4. सह्याद्री रुरल केअर किंवा जिल्हा रुग्णालयात कॅथ लॅब उपलब्ध आहे."
        : lang === 'hi'
        ? "⚠️ **सीने में दर्द / दिल का दौरा (Cardiac Alert):**\n1. मरीज को 45 डिग्री झुकाकर आराम से बैठाएं।\n2. चलना-फिरना बिल्कुल बंद कराएं।\n3. 108 एम्बुलेंस तुरंत बुलाएं।"
        : "⚠️ **Suspected Cardiac Emergency:**\n1. Position patient in a semi-sitting 45-degree angle.\n2. Advise complete physical rest without walking.\n3. Dispatch 108 ambulance with oxygen support immediately.",
      intent: 'emergency_cardiac',
      action: { type: 'call_108', label: '📞 कॉल १०८ रुग्णवाहिका' },
      quickSuggestions: ['कॅथ लॅब हॉस्पिटल्स', '१०८ कॉल', 'प्रथमोपचार']
    };
  }

  // 3. MATERNAL / PREGNANCY
  if (q.includes('गरोदर') || q.includes('बाळंत') || q.includes('प्रसूती') || q.includes('रक्त') || q.includes('pregnant') || q.includes('maternal') || q.includes('गर्भ')) {
    return {
      reply: lang === 'mr'
        ? "🤰 **गरोदर माता व प्रसूती काळजी मार्गदर्शक:**\n1. गरोदर मातेला **डाव्या कुशीवर** झोपवा जेणेकरून बाळाला रक्तपुरवठा सुरळीत राहील.\n2. जर अतिरक्तस्त्राव, डोकेदुखी किंवा पायाला जास्त सूज असेल तर हे हाय-रिस्क लक्षण आहे.\n3. जुन्नर ग्रामीण रुग्णालय किंवा जिल्हा सिव्हिल हॉस्पिटलमध्ये २४x७ मोफत प्रसूती व सिझेरियन सुविधा उपलब्ध आहे.\n4. आशा सेविकेने १०२ जननी रुग्णवाहिका बुक करावी."
        : lang === 'hi'
        ? "🤰 **गर्भावस्था व प्रसव सहायता:**\n1. गर्भवती महिला को बाईं करवट (Left lateral) लिटाएं।\n2. तेज सिरदर्द या रक्तस्राव होने पर तत्काल अस्पताल ले जाएं।\n3. 102 जननी एम्बुलेंस कॉल करें।"
        : "🤰 **Maternal & Pregnancy Guidance:**\n1. Place mother in Left Lateral position to optimize blood flow.\n2. Heavy bleeding, severe headache, or high BP are high-risk alarms.\n3. Free 24x7 delivery available at Sub-District hospitals. Call 102.",
      intent: 'maternal_care',
      action: { type: 'call_102', label: '📞 कॉल १०२ जननी रुग्णवाहिका' },
      quickSuggestions: ['प्रसूती हॉस्पिटल्स', 'हाय-रिस्क लक्षणे', '१०२ कॉल']
    };
  }

  // 4. MILD FEVER / KADHA (40% Offline)
  if (q.includes('fever') || q.includes('ताप') || q.includes('बुखार') || q.includes('कणकण') || q.includes('थंडी')) {
    return {
      reply: lang === 'mr'
        ? "🌿 **सौम्य ताप व अंगदुखीवर घरगुती काढा व उपाय (४०% ऑफलाइन):**\n1. **तुळस-आले-मिरे काढा:** १० तुळशीची पाने, ठेचलेले आले व ३ काळे मिरे २ कप पाण्यात उकळून १ कप करा. कोमट असताना गूळ/मधासोबत दिवसातून २ वेळा प्या.\n2. कपाळावर व मानेवर **थंड पाण्याच्या घड्या** ठेवा.\n3. **औषध:** पॅरासिटामॉल ५०० मिग्रॅ (Paracetamol 500mg) जेवणानंतर.\n4. **धोक्याची घंटा:** ताप १०२°F पेक्षा जास्त असल्यास किंवा ३ दिवसांपेक्षा जास्त राहिल्यास PHC ला जा."
        : lang === 'hi'
        ? "🌿 **हल्के बुखार पर घरेलू काढ़ा व उपाय:**\n1. **तुलसी-अदरक काढ़ा:** तुलसी पत्ते, कुटा हुआ अदरक व काली मिर्च पानी में उबालकर पिएं।\n2. माथे पर ठंडे पानी की पट्टी रखें।\n3. पैरासिटामोल 500mg भोजन के बाद लें।"
        : "🌿 **Mild Fever & Viral Care (40% Offline):**\n1. **Tulsi-Ginger Kadha:** Boil tulsi leaves, crushed ginger and black pepper. Drink warm twice daily.\n2. Cold water sponge on forehead.\n3. Paracetamol 500mg post meals.",
      intent: 'remedy_fever',
      action: { type: 'view_remedies', label: '🌿 सर्व ४०% काढे पहा' },
      quickSuggestions: ['काढा कसा बनवायचा?', 'औषध प्रमाण', 'धोक्याची लक्षणे']
    };
  }

  // 5. LOOSE MOTION / ORS / DEHYDRATION (40% Offline)
  if (q.includes('जुलाब') || q.includes('दस्त') || q.includes('मोशन') || q.includes('ors') || q.includes('vomit') || q.includes('उलटी') || q.includes('loose')) {
    return {
      reply: lang === 'mr'
        ? "💧 **जुलाब व डिहायड्रेशनवर तातडीचे उपाय:**\n1. **घरगुती ORS द्रावण:** १ लिटर उकळून थंड केलेले पाणी + ६ छोटे चमचे साखर + अर्धा चमचा मीठ मिसळा.\n2. **तांदळाची पेज (Kanji):** मऊ भाताचे पाणी काढून त्यात चिमूटभर मीठ व जिरेपूड टाकून प्रत्येक जुलाबानंतर १ पेला प्या.\n3. डाळिंबाचा रस किंवा ताक प्यावे.\n4. जर लघवी बंद झाली किंवा विष्ठेत रक्त दिसले तर त्वरित PHC जा."
        : lang === 'hi'
        ? "💧 **दस्त और निर्जलीकरण पर तुरंत उपाय:**\n1. **घर का ओआरएस:** 1 लीटर पानी + 6 चम्मच चीनी + आधा चम्मच नमक।\n2. चावल का मांड (पेज) नमक डालकर पिएं।"
        : "💧 **Diarrhea & Dehydration Care:**\n1. **Homemade ORS:** 1L boiled water + 6 tsp sugar + 1/2 tsp salt.\n2. Rice water (Kanji) with pinch of rock salt after every stool.",
      intent: 'remedy_diarrhea',
      action: { type: 'view_remedies', label: '💧 ORS पद्धत पहा' },
      quickSuggestions: ['ORS बनवण्याची पद्धत', 'तांदळाची पेज', 'PHC कधी जावे?']
    };
  }

  // 6. BEDS / HOSPITALS / BLOOD
  if (q.includes('bed') || q.includes('बेड') || q.includes('icu') || q.includes('हॉस्पिटल') || q.includes('रुग्णालय') || q.includes('hospital') || q.includes('रक्त') || q.includes('blood')) {
    return {
      reply: lang === 'mr'
        ? "🏥 **थेट रुग्णालय, बेड्स व रक्त साठा माहिती:**\n• **त्र्यंबकेश्वर PHC (शासकीय - मोफत):** ICU: १ बेड, जनरल: १२ बेड्स, O+ रक्त: ८ युनिट.\n• **जुन्नर ग्रामीण रुग्णालय (शासकीय):** ICU: ३ बेड्स, जनरल: १८ बेड्स, O+ रक्त: २२ युनिट.\n• **संजीवनी चॅरिटेबल (किफायती खाजगी):** जनरल बेड: ₹४००/दिवस, ICU: ₹२,५००/दिवस.\n• **सह्याद्री रुरल केअर (मध्यम खाजगी):** ICU: ५ बेड्स, O+ रक्त: २८ युनिट."
        : lang === 'hi'
        ? "🏥 **लाइव अस्पताल, बेड्स व ब्लड स्टॉक:**\n• त्र्यंबकेश्वर PHC (सरकारी - मुफ्त): ICU 1, जनरल 12 बेड्स।\n• जुन्नर ग्रामीण अस्पताल: ICU 3, जनरल 18 बेड्स, O+ ब्लड 22 यूनिट।"
        : "🏥 **Live Hospital Beds & Blood Stock:**\n• Trimbak PHC (Govt Free): ICU: 1, Gen: 12 beds, O+ Blood: 8 units.\n• Junnar Rural Hospital: ICU: 3, Gen: 18 beds, O+ Blood: 22 units.\n• Sanjeevani Trust (Budget): Gen bed ₹400/day, ICU ₹2,500/day.",
      intent: 'hospitals_beds',
      action: { type: 'view_hospitals', label: '🏥 सर्व रुग्णालये पहा' },
      quickSuggestions: ['शासकीय मोफत रुग्णालये', 'खाजगी खर्च अंदाज', 'रक्तपेढी साठा']
    };
  }

  // 7. ASHA WORKER / SURVEY
  if (q.includes('asha') || q.includes('आशा') || q.includes('नोंद') || q.includes('लसीकरण') || q.includes('survey')) {
    return {
      reply: lang === 'mr'
        ? "👩‍⚕️ **आशा सेविका डिजिटल सहाय्यक:**\n• तुम्ही इंटरनेट नसतानाही दुर्गम पाड्यांमध्ये नवीन गरोदर माता व बालकांची नोंद करू शकता.\n• **हाय-रिस्क गरोदर माता निकष:** Hb < 9 gm/dL, BP > 140/90 mmHg, पायाला सूज.\n• मोबाईलला इंटरनेट कनेक्ट होताच 'Sync Now' बटनावर क्लिक करून सर्व नोंदी जिल्हा सर्व्हरवर सिंक करा."
        : lang === 'hi'
        ? "👩‍⚕️ **आशा कार्यकर्ता डिजिटल सहायता:**\n• बिना इंटरनेट भी नए मरीजों का रिकॉर्ड दर्ज करें।\n• नेटवर्क आने पर 'Sync Now' से सरकारी पोर्टल पर भेजें।"
        : "👩‍⚕️ **ASHA Worker Assistant:**\n• Record maternal and child logs offline in remote tribal padas.\n• 1-Click Sync uploads your queue to the district portal once connected.",
      intent: 'asha_suite',
      action: { type: 'view_asha', label: '📋 आशा नोंदवही उघडा' },
      quickSuggestions: ['नवीन रुग्ण नोंदवा', 'हाय-रिस्क निकष', 'ऑफलाइन सिंक']
    };
  }

  // Default App-Constrained Fallback
  return {
    reply: lang === 'mr'
      ? "मी **आरोग्य AI साथी** आहे. मी तुम्हाला ग्रामीण आरोग्य, लक्षण तपासणी, ४०% घरगुती काढे, शासकीय/खाजगी रुग्णालये, बेड्स, रक्त साठा आणि आशा सेविका कामात मार्गदर्शन करू शकतो. कृपया तुमच्या आरोग्याची तक्रार सांगा किंवा खालील पर्यायांवर टॅप करा."
      : lang === 'hi'
      ? "मैं **आरोग्य AI साथी** हूँ। मैं ग्रामीण स्वास्थ्य, लक्षण जांच, घरेलू नुस्खे, अस्पताल बेड्स व आशा कार्यकर्ता कार्यों में सहायता कर सकता हूँ। कृपया अपना प्रश्न पूछें।"
      : "I am **Aarogya AI**, your rural healthcare assistant for Maharashtra. Ask me about symptoms, 40% Kadha home remedies, emergency 108 triage, hospital bed/blood availability, or ASHA logs.",
    intent: 'general_help',
    action: { type: 'view_triage', label: '🩺 लक्षण तपासणी करा' },
    quickSuggestions: ['ताप आला आहे', 'सर्पदंश प्रथमोपचार', 'जवळचे ICU बेड्स', 'गरोदरपण काळजी']
  };
}
