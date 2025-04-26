import {
  activecampaign,
  afterpay,
  airwallex,
  amplitude,
  asana,
  fb,
  insta,
  twitter,
  reviewStars,
  reviewStars2,
  reviewPerson,
  reviewPerson2,
  liquidWasteCollectionImg,
  solidWasteCollectionImg,
  recyclingServicesImg,
  teamMember,
  teamBg,
  efficientCollectionImg,
  inovativeSortingImg,
  disposableMethodsImg,
  reviewPerson4,
  reviewPerson5,
  reviewPerson3,
  teamMember2,
  teamMember3,
} from "../assets";

export const navLinks = [
  {
    id: "/",
    title: "Home",
  },
  {
    id: "/services",
    title: "Services",
  },
  {
    id: "/aboutus",
    title: "About Us",
  },
  {
    id: "/redeem",  // Add new redeem route
    title: "Redeem",
  },
  {
    id: "/contactus",
    title: "Contact Us",
  },
];

export const clients = [
  {
    id: "client-1",
    logo: activecampaign,
  },
  {
    id: "client-2",
    logo: afterpay,
  },
  {
    id: "client-3",
    logo: airwallex,
  },
  {
    id: "client-4",
    logo: amplitude,
  },
  {
    id: "client-5",
    logo: asana,
  },
];

export const socialMedia = [
  {
    id: "social-media-1",
    icon: fb,
    link: "https://www.instagram.com/",
  },
  {
    id: "social-media-2",
    icon: twitter,
    link: "https://www.twitter.com/",
  },
  {
    id: "social-media-3",
    icon: insta,
    link: "https://www.facebook.com/",
  },
];

export const teamMembers = [
  {
    id: "member-1",
    img: teamMember,
    name: "Jessica",
    title: "Lorem Ipsum",
    background: teamBg,
  },
  {
    id: "member-2",
    img: teamMember2,
    name: "Jessica",
    title: "Lorem Ipsum",
    background: teamBg,
  },
  {
    id: "member-3",
    img: teamMember3,
    name: "Jessica",
    title: "Lorem Ipsum",
    background: teamBg,
  },
];

export const testimonials = [
  {
    id: "testimonials-1",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    name: "Sam Ron",
    img: reviewPerson,
    rating: reviewStars2,
  },
  {
    id: "testimonials-2",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    name: "Jessica",
    img: reviewPerson2,
    rating: reviewStars,
  },
  {
    id: "testimonials-3",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    name: "Anna",
    img: reviewPerson3,
    rating: reviewStars2,
  },
  {
    id: "testimonials-4",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    name: "Sarah",
    img: reviewPerson4,
    rating: reviewStars2,
  },
  {
    id: "testimonials-5",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    name: "John Dux",
    img: reviewPerson5,
    rating: reviewStars,
  },
  {
    id: "testimonials-6",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    name: "Jessica",
    img: reviewPerson,
    rating: reviewStars2,
  },
];

export const workingHours = [
  {
    id: "hour-1",
    day: "Monday",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-2",
    day: "Tuesday",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-3",
    day: "Wednesday",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-4",
    day: "Thursday",
    timing: "9:00 AM To 6:00 PM",
  },
  {
    id: "hour-5",
    day: "Friday",
    timing: "9:00 AM To 6:00 PM",
  },
];

export const servicesCards = [
  {
    id: "card-1",
    title: "Recycling Services",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    img: recyclingServicesImg,
  },
  {
    id: "card-2",
    title: "Solid Waste Collection",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    img: solidWasteCollectionImg,
  },
  {
    id: "card-3",
    title: "Liquid Waste Collection",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    img: liquidWasteCollectionImg,
  },
];

export const processesCards = [
  {
    id: "card-1",
    title: "Efficient Collection",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    img: efficientCollectionImg,
  },
  {
    id: "card-2",
    title: "Innovative Sorting Techniques",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    img: inovativeSortingImg,
  },
  {
    id: "card-3",
    title: "Eco-Friendly Disposal Methods",
    content:
      "“Es ist ein lang erwiesener Fakt, dass ein Leser vom Text wird, wenn er sich ein Layout ansieht.”",
    img: disposableMethodsImg,
  },
];

export const stats = [
  {
    id: "stats-1",
    title: "Completed Projects",
    value: "210",
  },
  {
    id: "stats-2",
    title: "Clients Helped",
    value: "100K",
  },
];

export const footerLinks = [
  {
    title: "Company",
    links: [
      {
        name: "Home",
        link: "/",
      },
      {
        name: "Services",
        link: "/services",
      },
      {
        name: "About Us",
        link: "/aboutus",
      },
      {
        name: "Redeem",  // Add new redeem link
        link: "/redeem",
      },
      {
        name: "Contact Us",
        link: "/contactus",
      },
    ],
  },
  {
    title: "Services",
    links: [
      {
        name: "Recycling Services",
        link: "/services",
      },
      {
        name: "Solid Waste Collection",
        link: "/services",
      },
      {
        name: "Liquid Waste Collection",
        link: "/services",
      },
      {
        name: "Collection Services",
        link: "/services",
      },
    ],
  },
];

export const faqs = [
  {
    id: 1,
    question: "Popular Articles",
    answer:
      "Suspendisse ipsum elit, hendrerit id eleifend at, condimentum et mauris. Curabitur et libero vel arcu dignissim pulvinar ut ac leo. In sit amet orci et erat accumsan interdum.",
  },
  {
    id: 2,
    question: "Fix problems & request removals",
    answer:
      "Suspendisse ipsum elit, hendrerit id eleifend at, condimentum et mauris. Curabitur et libero vel arcu dignissim pulvinar ut ac leo. In sit amet orci et erat accumsan interdum.",
  },
  {
    id: 3,
    question: "Browse the web",
    answer:
      "Suspendisse ipsum elit, hendrerit id eleifend at, condimentum et mauris. Curabitur et libero vel arcu dignissim pulvinar ut ac leo. In sit amet orci et erat accumsan interdum.",
  },
  {
    id: 4,
    question: "Search on your phone or tablet",
    answer:
      "Suspendisse ipsum elit, hendrerit id eleifend at, condimentum et mauris. Curabitur et libero vel arcu dignissim pulvinar ut ac leo. In sit amet orci et erat accumsan interdum.",
  },
  {
    id: 5,
    question: "Fix problems & request removals",
    answer:
      "Suspendisse ipsum elit, hendrerit id eleifend at, condimentum et mauris. Curabitur et libero vel arcu dignissim pulvinar ut ac leo. In sit amet orci et erat accumsan interdum.",
  },
];
