"""
Commission for Air Quality Management (CAQM) Graded Response Action Plan (GRAP).
Applicable to Delhi-NCR. Verified against CAQM Notification (revised 2023/2024).
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class GRAPStage:
    stage_number: int
    name: str
    aqi_threshold_text: str
    trigger_aqi_min: int
    trigger_aqi_max: int
    mandatory_actions_en: list[str]
    mandatory_actions_hi: list[str]
    mandatory_actions_mr: list[str]
    citizen_advisory_en: list[str]
    citizen_advisory_hi: list[str]
    citizen_advisory_mr: list[str]


GRAP_STAGES: list[GRAPStage] = [
    GRAPStage(
        stage_number=1,
        name="Stage I - 'Poor' Air Quality",
        aqi_threshold_text="AQI 201 - 300",
        trigger_aqi_min=201,
        trigger_aqi_max=300,
        mandatory_actions_en=[
            "Strict ban on open burning of biomass and municipal solid waste.",
            "Water sprinkling on roads and mechanized sweeping.",
            "Enforcement of anti-dust guidelines at construction sites.",
            "Strict PUC (Pollution Under Control) norm enforcement for vehicles.",
        ],
        mandatory_actions_hi=[
            "बायोमास और कचरा खुले में जलाने पर सख्त प्रतिबंध।",
            "सड़कों पर पानी का छिड़काव और मशीनीकृत सफाई।",
            "निर्माण स्थलों पर धूल नियंत्रण नियमों का कड़ाई से पालन।",
            "वाहनों के लिए सख्त पीयूसी जांच।",
        ],
        mandatory_actions_mr=[
            "बायोमास आणि कचरा उघड्यावर जाळण्यावर कडक बंदी.",
            "रस्त्यांवर पाण्याचा शिडकावा आणि यांत्रिक स्वच्छता.",
            "बांधकाम ठिकाणी धूळ नियंत्रण नियमांची काटेकोर अंमलबजावणी.",
            "वाहनांसाठी पीयूसी नियमांचे कडक पालन.",
        ],
        citizen_advisory_en=[
            "Keep vehicle engines properly tuned and maintain recommended tire pressure.",
            "Do not idle engines at red lights.",
            "Dispose of household waste through designated municipal channels, never burn it.",
        ],
        citizen_advisory_hi=[
            "वाहनों की सर्विसिंग समय पर कराएं और टायरों में सही हवा रखें।",
            "रेड लाइट पर इंजन बंद रखें।",
            "घर का कचरा केवल अधिकृत कचरा संग्रहकर्ता को दें, जलाएं नहीं।",
        ],
        citizen_advisory_mr=[
            "वाहनांची वेळेवर दुरुस्ती करा आणि योग्य हवेचा दाब ठेवा.",
            "रेड लाईटवर इंजिन बंद ठेवा.",
            "कचरा उघड्यावर न जाळता घंटागाडीतच टाका.",
        ],
    ),
    GRAPStage(
        stage_number=2,
        name="Stage II - 'Very Poor' Air Quality",
        aqi_threshold_text="AQI 301 - 400",
        trigger_aqi_min=301,
        trigger_aqi_max=400,
        mandatory_actions_en=[
            "Regulated power supply to avoid private diesel generator (DG) set usage.",
            "Enhanced parking fees to discourage private motor vehicle usage.",
            "Augmentation of CNG / electric bus and metro service frequencies.",
            "Daily mechanical sweeping and water sprinkling with dust suppressants.",
        ],
        mandatory_actions_hi=[
            "डीजल जनरेटर (डीजी सेट) का उपयोग रोकने हेतु निर्बाध बिजली आपूर्ति।",
            "निजी वाहनों के उपयोग को हतोत्साहित करने हेतु पार्किंग शुल्क में वृद्धि।",
            "सीएनजी/इलेक्ट्रिक बसों और मेट्रो फेरों में वृद्धि।",
            "धूल दबाने वाले रसायनों के साथ दैनिक मशीनीकृत झाड़ू और पानी का छिड़काव।",
        ],
        mandatory_actions_mr=[
            "डिझेल जनरेटरचा वापर टाळण्यासाठी अखंड वीज पुरवठा.",
            "खाजगी वाहनांचा वापर कमी करण्यासाठी पार्किंग शुल्कात वाढ.",
            "मेट्रो आणि सीएनजी/इलेक्ट्रिक बसेसच्या फेऱ्यांमध्ये वाढ.",
            "धूळ प्रतिबंधक उपायांसह रस्त्यांची स्वच्छता.",
        ],
        citizen_advisory_en=[
            "Use public transport (Metro or CNG bus) instead of private two-wheelers or cars.",
            "Replace home air filters regularly.",
            "Avoid dust-generating home renovation activities during this phase.",
        ],
        citizen_advisory_hi=[
            "निजी वाहन के स्थान पर सार्वजनिक परिवहन (मेट्रो/बस) का प्रयोग करें।",
            "घर के एयर फिल्टर नियमित बदलें।",
            "धूल पैदा करने वाले गृह निर्माण या मरम्मत कार्य टालें।",
        ],
        citizen_advisory_mr=[
            "खाजगी वाहनांऐवजी सार्वजनिक वाहतुकीचा वापर करा.",
            "घरातील एअर फिल्टर वेळोवेळी तपासा आणि बदला.",
            "धूळ निर्माण होणारी दुरुस्तीची कामे पुढे ढकला.",
        ],
    ),
    GRAPStage(
        stage_number=3,
        name="Stage III - 'Severe' Air Quality",
        aqi_threshold_text="AQI 401 - 450",
        trigger_aqi_min=401,
        trigger_aqi_max=450,
        mandatory_actions_en=[
            "Strict ban on non-essential construction and demolition activities in NCR.",
            "Ban on plying of BS-III petrol and BS-IV diesel four-wheelers in Delhi and adjoining districts.",
            "Closure of brick kilns and stone crushers not running on approved clean fuel.",
            "State governments may suspend physical classes for children up to Class 5.",
        ],
        mandatory_actions_hi=[
            "एनसीआर में गैर-आवश्यक निर्माण और तोड़फोड़ गतिविधियों पर पूर्ण प्रतिबंध।",
            "दिल्ली व आसपास बीएस-3 पेट्रोल और बीएस-4 डीजल 4-पहिया वाहनों पर प्रतिबंध।",
            "स्वच्छ ईंधन पर न चलने वाले ईंट भट्ठों और स्टोन क्रशरों को बंद करना।",
            "कक्षा 5 तक के बच्चों के लिए प्राथमिक स्कूलों को ऑनलाइन करने का निर्देश।",
        ],
        mandatory_actions_mr=[
            "अनावश्यक बांधकाम आणि पाडकाम कामांवर पूर्ण बंदी.",
            "बीएस-३ पेट्रोल आणि बीएस-४ डिझेल चारचाकी वाहनांवर बंदी.",
            "विहित इंधनावर न चालणाऱ्या वीटभट्ट्या आणि खडी क्रशर बंद करणे.",
            "इयत्ता ५ वी पर्यंतच्या विद्यार्थ्यांसाठी शाळांचे वर्ग ऑनलाइन करणे.",
        ],
        citizen_advisory_en=[
            "Vulnerable groups (children, elderly, chronic respiratory/cardiac patients) should avoid outdoor exertion.",
            "Work from home if feasible.",
            "Wear a snug-fitting N95 mask for any necessary outdoor transit.",
        ],
        citizen_advisory_hi=[
            "बुजुर्ग, बच्चे और सांस के मरीज घर के अंदर ही रहें, बाहर निकलने से बचें।",
            "संभव हो तो वर्क फ्रॉम होम करें।",
            "बाहर निकलना जरूरी हो तो सही फिटिंग वाला N95 मास्क अवश्य पहनें।",
        ],
        citizen_advisory_mr=[
            "वृद्ध, लहान मुले आणि श्वसनविकार असलेल्यांनी घराबाहेर जाणे टाळावे.",
            "शक्य असल्यास वर्क फ्रॉम होमचा पर्याय निवडा.",
            "बाहेर पडणे आवश्यक असल्यास एन-९५ मास्क नक्की वापरा.",
        ],
    ),
    GRAPStage(
        stage_number=4,
        name="Stage IV - 'Severe+' Air Quality",
        aqi_threshold_text="AQI > 450",
        trigger_aqi_min=451,
        trigger_aqi_max=1000,
        mandatory_actions_en=[
            "Ban on entry of non-essential diesel truck traffic into Delhi (except LNG/CNG/electric).",
            "Ban on all construction activity including public infrastructure projects.",
            "Closure of middle and secondary schools (Classes 6-9, 11) transitioning to online learning.",
            "50% capacity advisory for public and private offices with mandatory work-from-home.",
        ],
        mandatory_actions_hi=[
            "दिल्ली में गैर-आवश्यक डीजल ट्रकों के प्रवेश पर पूर्ण रोक (एलएनजी/सीएनजी/इलेक्ट्रिक को छूट)।",
            "सार्वजनिक बुनियादी ढांचा परियोजनाओं सहित सभी निर्माण कार्यों पर पूर्ण रोक।",
            "कक्षा 6-9 और 11वीं के स्कूल बंद कर ऑनलाइन कक्षाएं संचालित करना।",
            "सरकारी और निजी कार्यालयों में 50% उपस्थिति और शेष के लिए घर से काम।",
        ],
        mandatory_actions_mr=[
            "अत्यावश्यक सेवा वगळता डिझेल ट्रकांच्या दिल्ली प्रवेशावर बंदी.",
            "सार्वजनिक पायाभूत सुविधांसह सर्व बांधकामे त्वरित थांबवणे.",
            "शाळा बंद करून विद्यार्थ्यांना ऑनलाइन शिक्षणाचा पर्याय देणे.",
            "कार्यालयांमध्ये ५०% कर्मचाऱ्यांची उपस्थिती आणि वर्क फ्रॉम होम.",
        ],
        citizen_advisory_en=[
            "Emergency situation: All individuals should remain indoors as much as possible.",
            "Run certified HEPA air purifiers continuously in closed bedrooms.",
            "Do not perform outdoor morning walks or strenuous physical training.",
        ],
        citizen_advisory_hi=[
            "आपातकालीन स्थिति: सभी लोग यथासंभव घर के अंदर ही रहें।",
            "कमरों की खिड़कियां बंद रखकर लगातार एयर प्यूरीफायर चलाएं।",
            "सुबह की सैर या बाहर भारी व्यायाम बिल्कुल न करें।",
        ],
        citizen_advisory_mr=[
            "आणीबाणीची परिस्थिती: प्रत्येकाने शक्यतो घरामध्येच राहावे.",
            "खिडक्या बंद ठेवा आणि घरात एअर प्युरिफायर चालू ठेवा.",
            "सकाळचा मॉर्निंग वॉक किंवा बाहेर व्यायाम करणे पूर्णपणे टाळा.",
        ],
    ),
]


def get_grap_stage(aqi: int) -> GRAPStage | None:
    """
    Returns active CAQM GRAP stage based on current or predicted AQI.
    Returns None if AQI <= 200 (Stage I triggers at AQI > 200).
    """
    if aqi <= 200:
        return None
    for stage in GRAP_STAGES:
        if stage.trigger_aqi_min <= aqi <= stage.trigger_aqi_max:
            return stage
    return GRAP_STAGES[-1]  # Highest (Stage IV) for extreme values
