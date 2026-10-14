/*
 * Becky's mailbox - content
 *
 * This is the only file you need to edit.
 * - birthday: her birthday (YYYY-MM-DD). The first letter arrives `daysBefore` days earlier.
 * - day: 0 = first day of the event, 7 = the birthday itself (with daysBefore: 7).
 * - text: leave an empty line between paragraphs.
 * - photos: put your pictures in the images/ folder and list them here (jpg, png, webp...).
 * Lines in [brackets] are spots to personalise with your own memories.
 */
window.MAILBOX_CONFIG = {
  birthday: "2026-10-31",
  daysBefore: 7,
  recipient: "Becky",
  locale: "fr-CA",
  signature: "Avec tout mon amour,\nJu ♡",
  showUpcoming: true,

  letters: [
    {
      day: 0,
      title: "Your very first letter",
      text: "Hi my love,\n\nSurprise! For the next seven days, this little red mailbox is going to get a letter for you every single morning. Each one holds a memory of us that I never want to forget.\n\nLet's start at the beginning: the day we met. [Where were you? What was she wearing? What was the first thing you noticed about her?]\n\nI had no idea that day that you'd become my favourite person in the whole world.",
      photos: [
        { src: "images/placeholder-1.svg", caption: "Where it all started" }
      ]
    },
    {
      day: 1,
      title: "Our first date",
      text: "Do you remember our first date?\n\n[Tell the story: where you went, what you ate, the moment you knew it was going well.]\n\nI was so nervous, but you made everything feel easy. I still think about how you laughed that night.",
      photos: [
        { src: "images/placeholder-2.svg", caption: "Nervous but happy" },
        { src: "images/placeholder.JPG", caption: "That smile ♡" }
      ]
    },
    {
      day: 2,
      title: "The little things",
      text: "Today's letter is about the little things.\n\nThe way you [a cute habit she has]. How you always [something she does for you]. The face you make when [a funny detail].\n\nNobody else would notice them, but they're some of my favourite things in the world.",
      photos: [
        { src: "images/placeholder-4.svg", caption: "One of those little moments" }
      ]
    },
    {
      day: 3,
      title: "That trip",
      text: "Remember [the trip / the weekend away]?\n\n[What happened, what went wrong, what made it perfect anyway.]\n\nHonestly, I'd go anywhere as long as it's with you.",
      photos: [
        { src: "images/placeholder-5.svg", caption: "Adventure time" },
        { src: "images/placeholder-6.svg", caption: "Best view (not the landscape)" },
        { src: "images/placeholder-1.svg", caption: "Still my favourite picture" }
      ]
    },
    {
      day: 4,
      title: "Laughing until it hurt",
      text: "This one always makes me smile.\n\n[The funniest memory you share: the inside joke, the disaster dinner, the dance in the kitchen...]\n\nThank you for making my life so much funnier.",
      photos: [
        { src: "images/placeholder-2.svg", caption: "We couldn't stop laughing" }
      ]
    },
    {
      day: 5,
      title: "Home is you",
      text: "Some of my favourite memories are the quiet ones.\n\n[A cozy night in, a lazy Sunday, a moment where you felt completely at home with her.]\n\nWherever you are, that's home for me.",
      photos: [
        { src: "images/placeholder-3.svg", caption: "Cozy days" },
        { src: "images/placeholder-4.svg", caption: "My favourite place" }
      ]
    },
    {
      day: 6,
      title: "Tomorrow is your day",
      text: "Only one more sleep!\n\n[A memory from one of her past birthdays, or what you love about who she is today.]\n\nGet some rest, because tomorrow is all about you.",
      photos: [
        { src: "images/placeholder-5.svg", caption: "Almost there" }
      ]
    },
    {
      day: 7,
      title: "Happy Birthday, Becky!",
      text: "Happy birthday, my love!\n\nSeven letters, seven memories, and I still haven't said half of what you mean to me.\n\n[Your birthday message: what you wish for her this year, what you're looking forward to together.]\n\nHere's to many more birthdays, many more memories, and many more letters.",
      signature: "Forever yours,\n♡",
      photos: [
        { src: "images/placeholder-6.svg", caption: "To us" },
        { src: "images/placeholder-1.svg", caption: "And to many more" },
        { src: "images/placeholder-2.svg", caption: "I love you" }
      ]
    }
  ]
};
