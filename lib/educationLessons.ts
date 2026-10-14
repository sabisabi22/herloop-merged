
export type EducationLesson = {
  id: string;
  domain: string;
  title: string;
  level: string;
  duration: string;
  introduction: string;
  keyPoints: string[];
  example: string;
  activity: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  youtubeSearch: string;
  resources: { label: string; url: string }[];
};

export const educationLessons: EducationLesson[] = [
  {
    id: "fractions",
    domain: "School Studies",
    title: "Understanding Fractions",
    level: "Beginner",
    duration: "10 min",
    introduction:
      "A fraction represents a part of a whole. Imagine cutting a pizza into equal pieces. If you eat one piece out of four equal pieces, you have eaten one-fourth.",
    keyPoints: [
      "The numerator is the top number.",
      "The denominator is the bottom number.",
      "The denominator tells us how many equal parts make the whole.",
      "The numerator tells us how many parts we are considering.",
    ],
    example: "In 3/4, 3 is the numerator and 4 is the denominator.",
    activity:
      "Draw a rectangle, divide it into four equal parts, and shade three parts. Write the shaded fraction.",
    question: "In the fraction 2/5, what does the number 5 represent?",
    options: [
      "The number of selected parts",
      "The total number of equal parts",
      "The numerator",
      "The whole number",
    ],
    answer: 1,
    explanation:
      "The denominator is 5, so the whole is divided into five equal parts.",
    youtubeSearch: "fractions for beginners visual explanation",
    resources: [
      {
        label: "Khan Academy Maths",
        url: "https://www.khanacademy.org/math",
      },
      {
        label: "DIKSHA Learning Portal",
        url: "https://diksha.gov.in/",
      },
    ],
  },
  {
    id: "solar-system",
    domain: "Science & Discovery",
    title: "Our Solar System",
    level: "Beginner",
    duration: "10 min",
    introduction:
      "Our Solar System contains the Sun and the objects that orbit it, including eight planets, moons, asteroids, and comets. The Sun is a star at the centre of our planetary system.",
    keyPoints: [
      "The Sun provides most of Earth's light and heat.",
      "Earth is the third planet from the Sun.",
      "Planets orbit the Sun.",
      "The Moon orbits Earth.",
    ],
    example:
      "Earth takes about 365 days to complete one orbit around the Sun.",
    activity:
      "Write the eight planets in order, starting with the planet closest to the Sun.",
    question: "Which planet is closest to the Sun?",
    options: ["Earth", "Mars", "Mercury", "Jupiter"],
    answer: 2,
    explanation: "Mercury is the closest planet to the Sun.",
    youtubeSearch: "solar system for students planets explained",
    resources: [
      {
        label: "NASA Solar System",
        url: "https://science.nasa.gov/solar-system/",
      },
      {
        label: "PhET Science Simulations",
        url: "https://phet.colorado.edu/",
      },
    ],
  },
  {
    id: "html-basics",
    domain: "Technology & Coding",
    title: "Your First HTML Page",
    level: "Beginner",
    duration: "15 min",
    introduction:
      "HTML stands for HyperText Markup Language. It provides the structure of a web page using elements called tags.",
    keyPoints: [
      "HTML structures content on a web page.",
      "Many tags have an opening tag and a closing tag.",
      "The h1 element represents a main heading.",
      "The p element represents a paragraph.",
    ],
    example:
      '<h1>Hello World!</h1>\n<p>This is my first web page.</p>',
    activity:
      "Write an HTML heading containing your name and a paragraph describing one thing you like.",
    question: "Which HTML tag creates a paragraph?",
    options: ["<h1>", "<p>", "<img>", "<title>"],
    answer: 1,
    explanation: "The <p> tag is used to mark a paragraph.",
    youtubeSearch: "HTML tutorial for absolute beginners",
    resources: [
      {
        label: "freeCodeCamp",
        url: "https://www.freecodecamp.org/learn/",
      },
      {
        label: "W3Schools HTML Tutorial",
        url: "https://www.w3schools.com/html/",
      },
    ],
  },
  {
    id: "colour-theory",
    domain: "Arts & Creativity",
    title: "Introduction to Colour Theory",
    level: "Beginner",
    duration: "10 min",
    introduction:
      "Colour theory helps us understand how colours relate to each other and how they can be combined in art and design.",
    keyPoints: [
      "Primary colours in traditional painting are commonly taught as red, yellow, and blue.",
      "Secondary colours can be made by mixing pairs of primary colours.",
      "Complementary colours sit opposite each other on a colour wheel.",
      "Colour choices can influence the mood of a design.",
    ],
    example:
      "In traditional painting, mixing blue and yellow produces green.",
    activity:
      "Create a small colour wheel and label three primary and three secondary colours.",
    question:
      "Which colour is commonly produced by mixing blue and yellow paint?",
    options: ["Green", "Purple", "Black", "Pink"],
    answer: 0,
    explanation: "Blue and yellow paint are commonly mixed to make green.",
    youtubeSearch: "basic colour theory for beginners art design",
    resources: [
      {
        label: "Canva Design School",
        url: "https://www.canva.com/designschool/",
      },
      {
        label: "Krita Digital Painting",
        url: "https://krita.org/en/",
      },
    ],
  },
  {
    id: "budgeting",
    domain: "Business & Finance",
    title: "Learn to Make a Simple Budget",
    level: "Beginner",
    duration: "12 min",
    introduction:
      "A budget is a plan for how you will use your money. It helps you understand what comes in, what goes out, and how much you may be able to save.",
    keyPoints: [
      "Income is money received.",
      "Expenses are money spent.",
      "Savings are money set aside for future needs.",
      "A budget can be adjusted when circumstances change.",
    ],
    example:
      "If you receive ₹1,000 and spend ₹700, you have ₹300 remaining before any other expenses.",
    activity:
      "Create a sample budget using imaginary monthly income and three expense categories.",
    question:
      "You have ₹500 and spend ₹350. How much money remains?",
    options: ["₹100", "₹150", "₹250", "₹350"],
    answer: 1,
    explanation: "₹500 − ₹350 = ₹150 remains.",
    youtubeSearch: "budgeting and saving money basics for students",
    resources: [
      {
        label: "RBI Financial Education",
        url: "https://www.rbi.org.in/",
      },
      {
        label: "Khan Academy Economics",
        url: "https://www.khanacademy.org/economics-finance-domain",
      },
    ],
  },
  {
    id: "english-introduction",
    domain: "Languages & Communication",
    title: "Introduce Yourself in English",
    level: "Beginner",
    duration: "8 min",
    introduction:
      "A self-introduction is a short way to tell someone who you are. You can include your name, interests, studies, and goals.",
    keyPoints: [
      "Start with a greeting.",
      "Say your name clearly.",
      "Mention one or two interests.",
      "End politely and confidently.",
    ],
    example:
      "Hello! My name is Anu. I enjoy reading and learning technology. I am happy to meet you.",
    activity:
      "Write a four-sentence introduction about yourself and practise saying it aloud.",
    question: "Which is a suitable opening for a polite introduction?",
    options: [
      "Go away.",
      "Hello, nice to meet you.",
      "Give me that.",
      "You first.",
    ],
    answer: 1,
    explanation:
      "A greeting such as 'Hello, nice to meet you' is polite and friendly.",
    youtubeSearch: "English self introduction for beginners speaking practice",
    resources: [
      {
        label: "British Council LearnEnglish",
        url: "https://learnenglish.britishcouncil.org/",
      },
      {
        label: "Project Gutenberg Reading Library",
        url: "https://www.gutenberg.org/",
      },
    ],
  },
  {
    id: "map-reading",
    domain: "History & World Knowledge",
    title: "Understanding Maps",
    level: "Beginner",
    duration: "10 min",
    introduction:
      "A map is a representation of a place. Maps can show countries, roads, rivers, mountains, and many other features.",
    keyPoints: [
      "A map title tells you what the map shows.",
      "A legend explains the symbols used.",
      "A scale compares map distance with real distance.",
      "Many maps use a north arrow or compass rose for direction.",
    ],
    example:
      "If a map scale says 1 cm represents 5 km, then 2 cm represents 10 km.",
    activity:
      "Draw a simple map from your classroom to the school entrance. Add symbols and a legend.",
    question: "What does a map legend explain?",
    options: [
      "The map's symbols",
      "The weather tomorrow",
      "The age of the map reader",
      "The price of the map",
    ],
    answer: 0,
    explanation: "A legend explains the meaning of symbols on a map.",
    youtubeSearch: "map reading symbols scale and directions for beginners",
    resources: [
      {
        label: "National Geographic Education",
        url: "https://education.nationalgeographic.org/",
      },
      {
        label: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/",
      },
    ],
  },
  {
    id: "recycling",
    domain: "Life Skills & Wellbeing",
    title: "Reduce, Reuse, Recycle",
    level: "Beginner",
    duration: "8 min",
    introduction:
      "The three Rs are practical ways to reduce waste. Reducing means using less, reusing means using an item again, and recycling means processing suitable waste into new materials.",
    keyPoints: [
      "Reduce unnecessary consumption.",
      "Reuse items when safe and practical.",
      "Separate recyclable waste according to local guidance.",
      "Not every material can go into the same recycling bin.",
    ],
    example:
      "Carrying a reusable water bottle can reduce the need for disposable bottles.",
    activity:
      "Identify three items at home that could be reused or recycled appropriately.",
    question: "What does 'reuse' mean?",
    options: [
      "Throw something away immediately",
      "Use an item again",
      "Buy more items",
      "Mix all waste together",
    ],
    answer: 1,
    explanation: "Reuse means using an item again instead of discarding it.",
    youtubeSearch: "reduce reuse recycle explained for students",
    resources: [
      {
        label: "DIKSHA Learning Portal",
        url: "https://diksha.gov.in/",
      },
      {
        label: "UN Environment Programme",
        url: "https://www.unep.org/",
      },
    ],
  },
  {
    id: "career-strengths",
    domain: "Careers & Professional Skills",
    title: "Discover Your Strengths",
    level: "Beginner",
    duration: "10 min",
    introduction:
      "Strengths are things you do well or skills you can develop. Understanding your strengths can help you choose learning goals and explore careers.",
    keyPoints: [
      "Strengths may include communication, creativity, or problem-solving.",
      "Interests and strengths are related but not identical.",
      "Skills can improve with practice and feedback.",
      "A career choice does not have to be made all at once.",
    ],
    example:
      "If you enjoy solving puzzles, you might explore logic, programming, research, or other problem-solving activities.",
    activity:
      "Write down two things you enjoy, two skills you have, and one skill you want to practise.",
    question: "What is a useful way to improve a skill?",
    options: [
      "Avoid practising",
      "Practise and use feedback",
      "Compare yourself constantly",
      "Give up after one mistake",
    ],
    answer: 1,
    explanation:
      "Regular practice and useful feedback help you develop skills over time.",
    youtubeSearch: "career exploration strengths skills for students",
    resources: [
      {
        label: "National Career Service India",
        url: "https://www.ncs.gov.in/",
      },
      {
        label: "SWAYAM Courses",
        url: "https://swayam.gov.in/",
      },
    ],
  },
  {
    id: "number-series",
    domain: "Logic & Competitive Exams",
    title: "Find the Pattern",
    level: "Beginner",
    duration: "8 min",
    introduction:
      "A number series is a sequence of numbers that follows a pattern. Finding the rule helps you predict the next number.",
    keyPoints: [
      "Check whether the same number is added or subtracted.",
      "Look for multiplication or division patterns.",
      "Compare differences between neighbouring numbers.",
      "Always verify that the rule fits the whole series.",
    ],
    example:
      "In 2, 4, 6, 8, each number increases by 2, so the next number is 10.",
    activity:
      "Create your own five-number sequence and write the rule that generates it.",
    question: "What comes next: 5, 10, 15, 20, __?",
    options: ["21", "22", "25", "30"],
    answer: 2,
    explanation: "The series increases by 5 each time, so the next number is 25.",
    youtubeSearch: "number series reasoning questions beginner tutorial",
    resources: [
      {
        label: "IndiaBIX Aptitude Practice",
        url: "https://www.indiabix.com/",
      },
      {
        label: "Khan Academy Maths",
        url: "https://www.khanacademy.org/math",
      },
    ],
  },
];
