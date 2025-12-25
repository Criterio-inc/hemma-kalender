// Event theme definitions
export type EventCategory = 
  | "christmas"
  | "easter"
  | "midsummer"
  | "wedding"
  | "birthday"
  | "lucia"
  | "new_year"
  | "summer_vacation"
  | "sportlov"
  | "graduation"
  | "anniversary"
  | "custom";

export interface EventTheme {
  name: string;
  label: string;
  cssClass: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    extra?: string;
    gold?: string;
  };
  decorations: string[];
  icons: string[];
  animation?: string;
}

export const eventThemes: Record<EventCategory, EventTheme> = {
  christmas: {
    name: "christmas",
    label: "Jul",
    cssClass: "event-christmas",
    colors: {
      primary: "0 0% 100%",      // snow white
      secondary: "0 70% 50%",    // red
      accent: "122 39% 39%",     // green
      gold: "51 100% 50%",       // gold
    },
    decorations: ["snowflake", "gift", "tree", "lights", "gingerbread"],
    icons: ["Gift", "Snowflake", "TreePine"],
    animation: "twinkle",
  },
  easter: {
    name: "easter",
    label: "Påsk",
    cssClass: "event-easter",
    colors: {
      primary: "54 100% 95%",    // light yellow
      secondary: "45 100% 75%",  // yellow
      accent: "88 50% 67%",      // light green
      extra: "291 47% 82%",      // light purple
    },
    decorations: ["egg", "chick", "flower", "feather"],
    icons: ["Egg", "Flower2", "Sun"],
    animation: "bounce",
  },
  midsummer: {
    name: "midsummer",
    label: "Midsommar",
    cssClass: "event-midsummer",
    colors: {
      primary: "54 100% 95%",    // light yellow
      secondary: "199 92% 64%",  // blue
      accent: "45 100% 69%",     // yellow
      extra: "122 39% 63%",      // green
    },
    decorations: ["flower", "sun", "pole", "wreath"],
    icons: ["Sun", "Flower", "Music"],
    animation: "sway",
  },
  wedding: {
    name: "wedding",
    label: "Bröllop",
    cssClass: "event-wedding",
    colors: {
      primary: "30 100% 97%",    // champagne
      secondary: "0 100% 94%",   // light pink
      accent: "51 100% 50%",     // gold
    },
    decorations: ["rose", "heart", "ring", "lace"],
    icons: ["Heart", "Sparkles", "Wine"],
    animation: "shimmer",
  },
  birthday: {
    name: "birthday",
    label: "Födelsedag",
    cssClass: "event-birthday",
    colors: {
      primary: "280 100% 70%",   // rainbow gradient base
      secondary: "199 92% 64%",  // complementary
      accent: "51 100% 50%",     // gold
    },
    decorations: ["balloon", "confetti", "cake", "present", "streamer"],
    icons: ["Cake", "Gift", "PartyPopper"],
    animation: "confetti",
  },
  lucia: {
    name: "lucia",
    label: "Lucia",
    cssClass: "event-lucia",
    colors: {
      primary: "0 0% 100%",      // white
      secondary: "51 100% 50%",  // gold
      accent: "0 70% 50%",       // red
    },
    decorations: ["candle", "star", "saffron"],
    icons: ["Flame", "Star", "Crown"],
    animation: "flicker",
  },
  new_year: {
    name: "new_year",
    label: "Nyår",
    cssClass: "event-newyear",
    colors: {
      primary: "232 47% 29%",    // midnight blue
      secondary: "51 100% 50%",  // gold
      accent: "0 0% 100%",       // white
      extra: "330 81% 60%",      // pink
    },
    decorations: ["firework", "champagne", "confetti", "clock"],
    icons: ["Sparkles", "Wine", "Clock"],
    animation: "fireworks",
  },
  summer_vacation: {
    name: "summer_vacation",
    label: "Sommarlov",
    cssClass: "event-summer",
    colors: {
      primary: "54 100% 89%",    // light yellow
      secondary: "180 76% 55%",  // turquoise
      accent: "14 83% 63%",      // coral
    },
    decorations: ["wave", "sun", "icecream", "palm"],
    icons: ["Sun", "Waves", "Palmtree"],
    animation: "wave",
  },
  sportlov: {
    name: "sportlov",
    label: "Sportlov",
    cssClass: "event-sportlov",
    colors: {
      primary: "212 100% 94%",   // light blue
      secondary: "0 0% 100%",    // white
      accent: "213 71% 49%",     // blue
      extra: "0 83% 71%",        // red
    },
    decorations: ["mountain", "ski", "snowboard", "snow"],
    icons: ["Mountain", "Snowflake"],
    animation: "slide",
  },
  graduation: {
    name: "graduation",
    label: "Examen",
    cssClass: "event-graduation",
    colors: {
      primary: "0 0% 100%",      // white
      secondary: "239 84% 67%",  // indigo
      accent: "51 100% 50%",     // gold
    },
    decorations: ["cap", "diploma", "confetti"],
    icons: ["GraduationCap", "Award"],
    animation: "toss",
  },
  anniversary: {
    name: "anniversary",
    label: "Årsdag",
    cssClass: "event-anniversary",
    colors: {
      primary: "350 100% 97%",   // light rose
      secondary: "346 77% 61%",  // rose
      accent: "51 100% 50%",     // gold
    },
    decorations: ["heart", "flower", "sparkle"],
    icons: ["Heart", "Sparkles"],
    animation: "pulse",
  },
  custom: {
    name: "custom",
    label: "Övrigt",
    cssClass: "event-custom",
    colors: {
      primary: "217 91% 60%",    // blue
      secondary: "210 40% 96%",  // light
      accent: "217 91% 60%",     // blue
    },
    decorations: [],
    icons: ["Star", "Circle"],
  },
};

// Get theme by category
export const getEventTheme = (category: string): EventTheme => {
  return eventThemes[category as EventCategory] || eventThemes.custom;
};

// Check if category has special theme
export const hasSpecialTheme = (category: string): boolean => {
  return category !== "custom" && category in eventThemes;
};
