export const PAY_SCHEDULES = {
  weekly: { label: "Weekly", daysInPeriod: 7 },
  "bi-weekly": { label: "Bi-weekly", daysInPeriod: 14 },
  monthly: { label: "Monthly", daysInPeriod: 30 },
  "semi-monthly": { label: "Semi-monthly", daysInPeriod: 15 },
} as const;

export const TRANSACTION_CATEGORIES = {
  "fixed-costs": { 
    label: "Fixed Costs", 
    icon: "🏠", 
    color: "bg-neutral-600",
    description: "Rent, utilities, insurance, etc."
  },
  investments: { 
    label: "Investments", 
    icon: "📈", 
    color: "bg-blue-500",
    description: "401k, IRA, stocks, etc."
  },
  savings: { 
    label: "Savings", 
    icon: "🐷", 
    color: "bg-secondary",
    description: "Emergency fund, goals, etc."
  },
  "guilt-free-spending": { 
    label: "Guilt-Free Spending", 
    icon: "😊", 
    color: "bg-amber-500",
    description: "Entertainment, dining, hobbies, etc."
  },
} as const;

export const GOAL_CATEGORIES = {
  emergency: { label: "Emergency Fund", icon: "🚨", color: "bg-red-500" },
  vacation: { label: "Vacation", icon: "✈️", color: "bg-amber-500" },
  house: { label: "House", icon: "🏠", color: "bg-green-500" },
  other: { label: "Other", icon: "🎯", color: "bg-blue-500" },
} as const;

export const RAMIT_FRAMEWORK = {
  "fixed-costs": {
    recommended: { min: 50, max: 60 },
    description: "Essential expenses that don't change much month to month"
  },
  investments: {
    recommended: { min: 10, max: 20 },
    description: "Long-term wealth building through automated investing"
  },
  savings: {
    recommended: { min: 5, max: 10 },
    description: "Short-term goals and emergency fund"
  },
  "guilt-free-spending": {
    recommended: { min: 20, max: 35 },
    description: "Whatever's left after taking care of the essentials"
  },
} as const;

export const PSYCHOLOGY_INSIGHTS = [
  {
    title: "The Goalpost Problem",
    author: "Morgan Housel",
    content: "The hardest financial skill is getting the goalpost to stop moving. Happiness is results minus expectations.",
    tip: "Focus on systems and automation rather than constantly changing targets."
  },
  {
    title: "Compound Interest",
    author: "Morgan Housel", 
    content: "The most powerful force in finance is compound interest. Time is your greatest asset.",
    tip: "Start investing early and let time do the heavy lifting."
  },
  {
    title: "Automation First",
    author: "Ramit Sethi",
    content: "Don't rely on willpower to save money. Set up automatic transfers and let your system work for you.",
    tip: "Automate your investments and savings so you never have to think about them."
  },
  {
    title: "Rich Life",
    author: "Ramit Sethi",
    content: "Money is a tool to live your Rich Life. Spend extravagantly on the things you love, and cut costs mercilessly on the things you don't.",
    tip: "Identify what truly matters to you and allocate money accordingly."
  },
  {
    title: "Perfect vs Good",
    author: "Ramit Sethi",
    content: "A good plan executed today is better than a perfect plan executed never.",
    tip: "Start with simple automation and improve over time."
  },
] as const;
