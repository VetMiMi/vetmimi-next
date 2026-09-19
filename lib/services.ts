import art3 from "@/imports/image-3.png";
import art5 from "@/imports/image-5.png";
import art7 from "@/imports/image-7.png";

type Service = {
  slug: string;
  name: string;
  audience: string;
  summary: string;
  intro: string;
  image: string;
  imageAlt: string;
  tone: "rose" | "blue" | "gold";
  action: string;
  href: string;
  reassurance: string;
  fit: string;
  highlights: string[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  practical: { title: string; text: string }[];
  questions: { question: string; answer: string }[];
  closing: string;
  next: string;
};

export const services: Service[] = [
  {
    slug: "individual-art-therapy",
    name: "Individual Art Therapy",
    audience: "For yourself",
    summary: "One-to-one time with Daw Mi to explore thoughts and feelings through art and conversation.",
    intro: "Sometimes it is hard to put a feeling into words. In a private session with Daw Mi, you can use art and conversation to explore what is on your mind.",
    image: art3.src,
    imageAlt: "Flowing figure in sage, lavender and peach against a red background",
    tone: "rose",
    action: "Request an appointment",
    href: "/book",
    reassurance: "No art experience needed. You do not need to know what to make.",
    fit: "Start here if you would prefer individual support and time to focus on your own experiences. If you are unsure whether this service suits your needs, ask Daw Mi before making a request.",
    highlights: ["One-to-one conversation", "Time to make and reflect", "Space to go at your own pace"],
    stepsTitle: "What happens in a session?",
    steps: [
      { title: "Talk and settle in", text: "Begin with a conversation about how you are and what you would like to explore." },
      { title: "Try making something", text: "Use art materials at your own pace. The focus is on expressing yourself, rather than making a polished picture." },
      { title: "Look back together", text: "Talk about what you notice in your artwork and how you feel. Leave time to bring the session to a close." },
    ],
    practical: [
      { title: "Time, place and fee", text: "Ask about session length, location, online options and fees before arranging your appointment." },
      { title: "What to bring", text: "Check which materials are provided and whether you need to bring anything." },
      { title: "Making a request", text: "An appointment request is only confirmed when you receive a separate confirmation." },
    ],
    questions: [
      { question: "Do I need to be good at art?", answer: "No. You do not need drawing skills or a finished idea. Art-making is a way to explore and express yourself." },
      { question: "Will every session be the same?", answer: "No. You may spend more time talking in one session and more time making in another." },
      { question: "Can I ask a question before booking?", answer: "Yes. Use the contact page to ask about the service or practical details before sending an appointment request." },
    ],
    closing: "Take the first step at your own pace.",
    next: "Request an appointment, or ask Daw Mi a question if you would like to know more first.",
  },
  {
    slug: "group-art-wellbeing",
    name: "Group Art & Wellbeing",
    audience: "To create with others",
    summary: "Make art alongside other people, with time to pause, reflect and share if you want to.",
    intro: "A group session brings people together through a creative activity. You can make something in your own way, spend time with others, and choose what you want to share.",
    image: art5.src,
    imageAlt: "Pink peonies painted in a blue and white vase",
    tone: "blue",
    action: "Ask about a group",
    href: "/contact",
    reassurance: "No art experience needed. There is no pressure to share your work.",
    fit: "Start here if you would like to take part in art-making with other people. Contact Daw Mi to discuss suitable groups and ask about upcoming sessions.",
    highlights: ["Creative time with others", "Your own way of taking part", "Optional sharing and reflection"],
    stepsTitle: "What happens in a group?",
    steps: [
      { title: "Find a starting point", text: "A creative prompt, theme or material gives the group a place to begin." },
      { title: "Make at your own pace", text: "Spend time with the materials and try your own ideas. There is no need to copy anyone else." },
      { title: "Pause and share", text: "Look at what you have made. Share if you feel comfortable, then finish the session together." },
    ],
    practical: [
      { title: "Finding a group", text: "Ask about upcoming dates, group size and whether a session is suitable for you." },
      { title: "Before you join", text: "Check the fee, session length, location and how to register." },
      { title: "Materials and access", text: "Ask what is provided and share any practical access needs when you enquire." },
    ],
    questions: [
      { question: "Do I have to talk about my artwork?", answer: "You can choose what to share. You do not need to explain your work to the group." },
      { question: "How do I find the next session?", answer: "Send an enquiry to ask about upcoming groups and registration details." },
      { question: "Can I arrange something for my team?", answer: "For an organisation or an existing community group, see Workshops & Programs. That service starts with a conversation about your group and plans." },
    ],
    closing: "Interested in creating with others?",
    next: "Tell Daw Mi a little about what you are looking for and ask about suitable group sessions.",
  },
  {
    slug: "workshops-programs",
    name: "Workshops & Programs",
    audience: "For your organisation or community",
    summary: "Plan a creative workshop with Daw Mi around your group, setting and goals.",
    intro: "Bring a creative activity to your organisation, community or healthcare setting. Start by telling Daw Mi who it is for and what you have in mind, then discuss an approach that fits.",
    image: art7.src,
    imageAlt: "Expressive golden face with colourful marks against deep indigo",
    tone: "gold",
    action: "Discuss a workshop",
    href: "/contact",
    reassurance: "An early idea is enough to start a conversation.",
    fit: "Start here if you are organising an activity for other people. This could be for a community group, an organisation, a healthcare setting or an event.",
    highlights: ["Planned around your group", "Space to discuss your goals", "Practical details agreed together"],
    stepsTitle: "How do we plan a workshop?",
    steps: [
      { title: "Tell us about your group", text: "Share who will take part, where it might happen and your preferred timing. It is fine if some details are still undecided." },
      { title: "Make a plan together", text: "Discuss the creative activity, group size, materials, access needs and budget with Daw Mi." },
      { title: "Agree the details", text: "Confirm the format, date, fee and arrangements together before the workshop goes ahead." },
    ],
    practical: [
      { title: "People and purpose", text: "Who is the workshop for, roughly how many people, and what would you like them to take part in?" },
      { title: "Place and timing", text: "Share the location, preferred dates and how much time you have available." },
      { title: "Budget and access", text: "Include a budget range if you have one, plus any materials, space or access needs." },
    ],
    questions: [
      { question: "Do I need a complete plan?", answer: "No. Tell Daw Mi what you know so far. The first conversation can help clarify the idea and whether it is a good fit." },
      { question: "Can we discuss more than one session?", answer: "Yes. Include that in your enquiry so you can discuss the format and timing together." },
      { question: "How much will it cost?", answer: "The fee needs to be discussed for your project. Share your group size, timing and budget so Daw Mi can consider what is possible." },
    ],
    closing: "Have a group or an idea in mind?",
    next: "Send a short outline. You do not need to have every detail worked out.",
  },
];
