/**
 * ✨ مكان واحد لتعديل كل حاجة في Luna ✨
 * غيّر النصوص من هنا، من غير ما تلمس مكوّنات الواجهة.
 * الصور الفاضية بتظهر كأماكن جاهزة، من غير أي صورة مكسورة.
 * لإضافة صورة، حط مسارها في src، والمسار المثالي يكون داخل public/images.
 * caption اختياري؛ سيبه "" لو مش عايزة تعليق.
 */
export type Memory = {
  src: string;
  alt: string;
  caption: string;
  title: string;
};

export const siteContent = {
  brandName: "Luna",
  brandTagline: "  ",
  madeFor: "  ",

  // التاريخ يحتفل باليوم والشهر فقط. السنة بيتجاهلها المدقق تلقائيًا.
  specialDate: { day: 1, month: 7 },

  // أول رسالة بعد ما تفتكر التاريخ — غيّري هذا النص.
  firstMessage: "حاجة بسيطة كداا",

  // الرسالة الأخيرة — غيّري هذا النص.
  happyMessage: "بصي بقا يا مزتي اول حاجه بجد انتي احسن حد عرفتو في حياتي من ناحية كل حاجة حرفيا واقرب حد ليا دلوقتي وبحمد ربنا علي دا علشان انتي كداهوو عسلاية والله بجد وبحبك فشخ لما بتبقي متعصبة ومش عارفة تعملي ايه كدا بس بعيدا عن دا كله غ بجد انا بحبك اوي اوي اوي يا لونا بجد مش متخيلة ازااي وبجد ياريت نفضل كدا علطول من غير خناق بقا وتبطلي تكلمييي ولاااد مش هينفعوكي بحاجهه الهم مبعرفش اكتب كتير بجد يارتني كنت سجلت بس اللي عايز اقولول يعني انك اغلي حد عندي دلوقتي وبخاف عليكي اوي بجد وبغير عليكي برضو اه بغير الواحد مينفعش يغير علي اختو ولا ايه يعني ياريت بقا متعصبناش وبس يارب تبقا المسدج حلوة يعني مش عارف ازاي بس تمام هاففف فان يا مزهه",

  // 4–6 أماكن للصور. أضيفي مسارات صورك هنا؛ وسيبيها فاضية قبل الإضافة.
  photos: [
    { src: "/photo-1.jpg", alt: "   ", title: "يغوتي قمرر", caption: "" },
    { src: "/photo-2.jpg", alt: "   ", title: "الخدود العسل بقاا  ", caption: "" },
    { src: "/photo-3.jpg", alt: " ", title: " المزههه ", caption: "" },
    { src: "/photo-4.jpg", alt: "  ", title: "دا احانا نجيب بوسة بقاا ", caption: "" },
  ] satisfies Memory[],

  navigation: [
    { id: "date", label: " " },
    { id: "memories", label: "" },
    { id: "letter", label: " " },
  ],

  dateScreen: {
    eyebrow: "اختي اللي بحبهاااا",
    titleFirstLine: "افتكري تاريخ",
    titleSecondLine: "مميز",
    description: "اكتبي اليوم  وجمبو اسمو الشهر",
    label: "عيب والله لو معرفتيش من اول مره",
    placeholder: "اكتبي يا عجلة ",
    formatHint: "يوم / شهر",
    yearHint: "",
    button: " دوسي كداهوو",
    reassurance: "",
    privacy: "",
    illustrationTag: "بين النجوم والحكايات",
    illustrationCaption: "لو النجوم بتحكي… كانت هتحكي عنّك.",
  },

  // كل رسائل الخطأ هنا. أول إجابة فاضية لا تُحسب كم attempt.
  errors: {
    empty: "اكتبي التاريخ الأول 💗",
    firstWrong: "حاولي تاني يا حمارة",
    secondWrong: "حاولي تاني يا بقرة",
  },

  heartScreen: {
    eyebrow: "   شطوره تعليمييي",
    title: "",
    description: "ايوه ايوه يوم عيد ميلادي مميز علفكره",
    button: "كمّلي",
    quote: "🥰​🥰​🥰​🥰​",
  },

  momentsScreen: {
    eyebrow: "معندناش صور مع بعض   ",
    title: "بس دي احسن صور ليكي  ",
    description: "",
    emptyTitle: "  ",
    emptyDescription: "",
    emptyCaption: "  ",
    transitionNote: "",
    emptyAlt: "مكان صورة لذكرى من ذكرياتنا",
    imageLoadError: "الصورة مش ظاهرة دلوقتي، بس مكانها محفوظ.",
    zoomLabel: "كبّري الصورة",
    closeLabel: "إغلاق",
    continueLabel: "كمّلي ",
  },

  letterScreen: {
    eyebrow: "اخر حاجهه   ",
    title: "Happy Message",
    description: "منستهاش اهوو",
    greeting: "بمناسبة 11/11",
    signature: "  ",
    returnButton: "  ",
    postscript: "",
  },

  footer: {
    madeWithLove: "",
    note: "Adham Kamel",
    privacy: "",
  },
} as const;

export type Stage = "date" | "heart" | "memories" | "letter";
