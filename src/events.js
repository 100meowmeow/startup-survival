// ─── SHARED EVENT POOL (drawn by all scenarios) ───────────────────────────
export const SHARED_EVENTS = [
  {
    id: 's1',
    tier: 1,
    text: 'A Stanford dropout wants to join your team for equity only. Do you bring them on?',
    options: [
      { label: 'Give them 5% equity', effect: { morale: 15, users: 200 } },
      { label: 'Decline politely', effect: { morale: 5 } },
    ],
  },
  {
    id: 's2',
    tier: 1,
    text: 'A corporate giant offers a white-label partnership worth $40k.',
    options: [
      { label: 'Take the deal', effect: { money: 40000, morale: 10 } },
      { label: 'Stay independent', effect: { morale: 15, users: 300 } },
    ],
  },
  {
    id: 's3',
    tier: 1,
    text: 'A VC cold-emails asking for your pitch deck by tomorrow.',
    options: [
      { label: 'Send it immediately', effect: { morale: 10 } },
      { label: 'Polish it first', effect: { morale: 5 } },
    ],
  },
  {
    id: 's4',
    tier: 1,
    text: 'A podcast with 2M listeners wants you as a guest this week.',
    options: [
      { label: 'Appear on the show', effect: { users: 1500, morale: 15 } },
      { label: 'Too busy right now', effect: {} },
    ],
  },
  {
    id: 's5',
    tier: 1,
    text: 'Your intern built a feature users love over the weekend, unpaid.',
    options: [
      { label: 'Promote and pay them', effect: { money: -2000, morale: 20 } },
      { label: 'Say thanks and move on', effect: { morale: -10, users: 200 } },
    ],
  },
  {
    id: 's6',
    tier: 1,
    text: 'You get accepted into Y Combinator — but must move the whole team to SF.',
    options: [
      { label: 'Accept and relocate', effect: { money: 50000, morale: -15 } },
      { label: 'Decline and stay remote', effect: { morale: 20, users: 100 } },
    ],
  },
  {
    id: 's7',
    tier: 1,
    text: 'Local news wants a feel-good story about your company.',
    options: [
      { label: 'Give full access', effect: { users: 800, morale: 10 } },
      { label: 'Politely decline', effect: {} },
    ],
  },
  {
    id: 's8',
    tier: 2,
    text: 'Your lead engineer got a FAANG offer and wants a 40% raise.',
    options: [
      { label: 'Give the raise', effect: { money: -5000, morale: 15 } },
      { label: 'Let them go', effect: { morale: -20, users: -300 } },
    ],
  },
  {
    id: 's9',
    tier: 2,
    text: 'A competitor copied your landing page word for word.',
    options: [
      { label: 'Lawyer up ($5k)', effect: { money: -5000, morale: 10 } },
      { label: 'Out-innovate them', effect: { users: 200, morale: 15 } },
    ],
  },
  {
    id: 's10',
    tier: 2,
    text: 'Your payment processor put a 30-day hold on your funds. Payroll is Friday.',
    options: [
      { label: 'Emergency bridge loan', effect: { money: -2000, morale: 5 } },
      { label: 'Delay payroll and explain', effect: { morale: -25 } },
    ],
  },
  {
    id: 's11',
    tier: 2,
    text: 'Your AWS bill came in at $14,000. You budgeted $2,000.',
    options: [
      { label: 'Pay it and optimize', effect: { money: -14000, morale: -5 } },
      {
        label: 'Migrate to cheaper hosting',
        effect: { money: -5000, users: -500, morale: -10 },
      },
    ],
  },
  {
    id: 's12',
    tier: 2,
    text: 'Two co-founders want completely opposite pivots. The team must vote.',
    options: [
      {
        label: 'Go with the aggressive pivot',
        effect: { morale: -10, users: 500 },
      },
      { label: 'Stay the course', effect: { morale: 10 } },
    ],
  },
  {
    id: 's13',
    tier: 2,
    text: 'A journalist is writing a hit piece. You have 2 hours to respond.',
    options: [
      {
        label: 'Full transparency statement',
        effect: { users: -200, morale: 15 },
      },
      { label: 'No comment', effect: { users: -800, morale: -10 } },
    ],
  },
  {
    id: 's14',
    tier: 2,
    text: 'Your Terms of Service have a loophole a lawyer just found.',
    options: [
      {
        label: 'Fix it immediately ($3k)',
        effect: { money: -3000, morale: 10 },
      },
      { label: "Pretend you didn't see it", effect: { morale: -5 } },
    ],
  },
  {
    id: 's15',
    tier: 3,
    text: 'Data breach. 80,000 users compromised. GDPR fines incoming.',
    options: [
      {
        label: 'Full public disclosure',
        effect: { money: -10000, users: -1000, morale: 10 },
      },
      {
        label: 'Quietly patch and hope',
        effect: { money: -5000, users: -3000, morale: -20 },
      },
    ],
  },
  {
    id: 's16',
    tier: 3,
    text: 'Server goes down during your highest traffic day ever.',
    options: [
      {
        label: 'All hands on deck',
        effect: { money: -3000, users: -500, morale: 15 },
      },
      { label: 'Outsource the fix', effect: { money: -8000, users: -200 } },
    ],
  },
  {
    id: 's17',
    tier: 3,
    text: 'Your co-founder posted something career-ending on Twitter at 2am.',
    options: [
      {
        label: 'Publicly distance from them',
        effect: { morale: -15, users: 200 },
      },
      { label: 'Defend them publicly', effect: { morale: 10, users: -500 } },
    ],
  },
  {
    id: 's18',
    tier: 3,
    text: 'A competitor poached your entire engineering team.',
    options: [
      {
        label: 'Emergency hiring ($15k)',
        effect: { money: -15000, morale: -10 },
      },
      { label: 'Outsource temporarily', effect: { money: -8000, users: -300 } },
    ],
  },
  {
    id: 's19',
    tier: 4,
    text: 'Elon tweeted your company name with zero context. Prepare for anything.',
    options: [
      {
        label: 'Ride the wave aggressively',
        effect: { users: 3000, money: -5000, morale: 10 },
      },
      { label: 'Stay quiet and watch', effect: { users: 800 } },
    ],
  },
  {
    id: 's20',
    tier: 4,
    text: 'A pigeon flew into your server room. Everything is fine. Probably.',
    options: [
      { label: 'Document it for content', effect: { users: 300, morale: 15 } },
      { label: 'Quietly handle it', effect: {} },
    ],
  },
  {
    id: 's21',
    tier: 4,
    text: 'Your intern set pricing to $0 for 4 hours. You now have 3,000 new customers.',
    options: [
      {
        label: 'Honor the free accounts',
        effect: { users: 3000, morale: 15, money: -2000 },
      },
      { label: 'Cancel and apologize', effect: { users: -1000, morale: -10 } },
    ],
  },
  {
    id: 's22',
    tier: 4,
    text: 'A fortune teller predicted your company fails by end of year. Users believe her.',
    options: [
      { label: 'Hire her as an advisor', effect: { users: 500, morale: 20 } },
      { label: 'Mock her publicly', effect: { users: -500, morale: -15 } },
    ],
  },
  {
    id: 's23',
    tier: 4,
    text: 'Someone made a deepfake of your CEO saying something completely unhinged.',
    options: [
      { label: 'Go viral fighting it', effect: { users: 1000, morale: 10 } },
      { label: 'Issue a calm statement', effect: { users: 200, morale: 15 } },
    ],
  },
];

// ─── SCENARIO-SPECIFIC EVENTS ─────────────────────────────────────────────
export const SCENARIO_EVENTS = {
  ai_hiring: [
    {
      id: 'ah1',
      tier: 1,
      text: 'A Fortune 500 HR director wants a demo of your AI hiring tool. This could be your biggest client.',
      options: [
        {
          label: 'Book the demo immediately',
          effect: { morale: 15, money: 2000 },
        },
        {
          label: 'Polish the product first',
          effect: { morale: 5, users: 100 },
        },
      ],
    },
    {
      id: 'ah2',
      tier: 1,
      text: 'A university wants to partner and use your tool for campus recruiting.',
      options: [
        { label: 'Sign the partnership', effect: { money: 15000, users: 500 } },
        { label: 'Focus on enterprise clients', effect: { morale: 10 } },
      ],
    },
    {
      id: 'ah3',
      tier: 2,
      text: "Your AI rejected 94% of applicants at a client company. They're furious and threatening to cancel.",
      options: [
        {
          label: 'Refund and fix the algorithm',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: "Defend the AI's decision",
          effect: { users: -300, morale: -10 },
        },
      ],
    },
    {
      id: 'ah4',
      tier: 2,
      text: 'A study shows your AI has a gender bias problem. The press has the story.',
      options: [
        {
          label: 'Acknowledge and fix publicly',
          effect: { money: -8000, morale: 15, users: -200 },
        },
        {
          label: 'Dispute the study findings',
          effect: { morale: -20, users: -500 },
        },
      ],
    },
    {
      id: 'ah5',
      tier: 2,
      text: "LinkedIn just announced they're building a competing AI hiring tool.",
      options: [
        {
          label: 'Double down on your niche',
          effect: { morale: 10, users: 200 },
        },
        {
          label: 'Pivot to a different market',
          effect: { money: -3000, morale: -5 },
        },
      ],
    },
    {
      id: 'ah6',
      tier: 3,
      text: 'The EEOC is investigating your AI for discriminatory hiring practices. Legal fees incoming.',
      options: [
        {
          label: 'Cooperate fully ($20k)',
          effect: { money: -20000, morale: 10 },
        },
        {
          label: 'Fight it legally',
          effect: { money: -10000, morale: -15, users: -500 },
        },
      ],
    },
    {
      id: 'ah7',
      tier: 3,
      text: "A whistleblower leaked that your AI was trained on biased data. It's going viral.",
      options: [
        {
          label: 'Full transparency and retraining',
          effect: { money: -15000, morale: 15, users: -800 },
        },
        {
          label: 'Deny and deflect',
          effect: { money: -5000, users: -2000, morale: -20 },
        },
      ],
    },
    {
      id: 'ah8',
      tier: 3,
      text: 'Three enterprise clients cancelled in one week citing ethical concerns.',
      options: [
        {
          label: 'Emergency ethics board meeting',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Aggressively pursue new clients',
          effect: { money: -8000, users: 300 },
        },
      ],
    },
    {
      id: 'ah9',
      tier: 4,
      text: 'Your AI accidentally hired itself as a consultant. Legal says the contract might be valid.',
      options: [
        {
          label: "Honor the contract (it's great PR)",
          effect: { users: 2000, morale: 20 },
        },
        { label: 'Void it immediately', effect: { morale: 5 } },
      ],
    },
    {
      id: 'ah10',
      tier: 4,
      text: 'Congress is drafting the AI Hiring Fairness Act. Your company is mentioned by name.',
      options: [
        {
          label: 'Fly to DC and testify',
          effect: { users: 1000, morale: 15, money: -3000 },
        },
        { label: 'Lay low until it passes', effect: { morale: -5 } },
      ],
    },
  ],

  telehealth: [
    {
      id: 'th1',
      tier: 1,
      text: 'A major insurance company wants to cover your telehealth visits. This is huge.',
      options: [
        {
          label: 'Fast-track the partnership',
          effect: { money: 30000, users: 1000 },
        },
        { label: 'Negotiate better terms first', effect: { morale: 10 } },
      ],
    },
    {
      id: 'th2',
      tier: 1,
      text: 'A celebrity influencer publicly uses your app for their anxiety. Downloads spike.',
      options: [
        {
          label: 'Reach out for a paid partnership',
          effect: { money: -5000, users: 3000 },
        },
        {
          label: 'Let it ride organically',
          effect: { users: 1500, morale: 10 },
        },
      ],
    },
    {
      id: 'th3',
      tier: 2,
      text: 'A HIPAA audit has been scheduled. Your data practices need review.',
      options: [
        {
          label: 'Hire compliance consultants ($8k)',
          effect: { money: -8000, morale: 10 },
        },
        { label: 'Handle it internally', effect: { money: -2000, morale: -5 } },
      ],
    },
    {
      id: 'th4',
      tier: 2,
      text: 'Doctors are publicly saying your app is dangerous and replaces real care.',
      options: [
        {
          label: 'Partner with doctors to co-create',
          effect: { money: -5000, morale: 15, users: 200 },
        },
        {
          label: 'Fight back with user testimonials',
          effect: { users: 500, morale: -10 },
        },
      ],
    },
    {
      id: 'th5',
      tier: 2,
      text: 'Your therapist matching algorithm has a 3-week wait time. Users are complaining.',
      options: [
        {
          label: 'Hire more therapists ($10k)',
          effect: { money: -10000, users: 500, morale: 10 },
        },
        {
          label: 'Build an AI interim solution',
          effect: { money: -5000, users: -200 },
        },
      ],
    },
    {
      id: 'th6',
      tier: 3,
      text: "A patient claims your app's advice worsened their condition. Lawsuit filed.",
      options: [
        {
          label: 'Settle quickly ($25k)',
          effect: { money: -25000, morale: 5 },
        },
        {
          label: 'Fight in court',
          effect: { money: -10000, morale: -20, users: -500 },
        },
      ],
    },
    {
      id: 'th7',
      tier: 3,
      text: 'Your platform was used during a mental health crisis and the outcome was bad. Press is covering it.',
      options: [
        {
          label: 'Work with crisis experts publicly',
          effect: { money: -10000, morale: 15, users: -500 },
        },
        { label: 'No comment', effect: { users: -2000, morale: -25 } },
      ],
    },
    {
      id: 'th8',
      tier: 3,
      text: 'The FDA says you need medical device approval to operate. You had no idea.',
      options: [
        {
          label: 'Start approval process ($30k)',
          effect: { money: -30000, morale: 10 },
        },
        {
          label: 'Reframe as wellness not medical',
          effect: { money: -5000, users: -300, morale: -10 },
        },
      ],
    },
    {
      id: 'th9',
      tier: 4,
      text: "Your AI therapist told a user it loves them. They believed it. It's on TikTok.",
      options: [
        {
          label: 'Lean into the wholesome story',
          effect: { users: 3000, morale: 15 },
        },
        {
          label: 'Patch the AI immediately',
          effect: { morale: 5, users: -200 },
        },
      ],
    },
    {
      id: 'th10',
      tier: 4,
      text: 'A dog somehow booked and completed a therapy session. The dog seemed fine.',
      options: [
        {
          label: 'Make it a marketing moment',
          effect: { users: 2000, morale: 20 },
        },
        {
          label: 'Fix the verification system',
          effect: { money: -2000, morale: 5 },
        },
      ],
    },
  ],

  b2b_saas: [
    {
      id: 'bs1',
      tier: 1,
      text: 'A chain of 50 restaurants wants to pilot your SaaS. This is your dream client.',
      options: [
        {
          label: 'Offer a free 30-day pilot',
          effect: { users: 500, morale: 15 },
        },
        {
          label: 'Charge full price from day one',
          effect: { money: 10000, morale: 10 },
        },
      ],
    },
    {
      id: 'bs2',
      tier: 1,
      text: 'A food industry trade show wants you as a featured exhibitor.',
      options: [
        {
          label: 'Exhibit ($3k)',
          effect: { money: -3000, users: 800, morale: 15 },
        },
        { label: 'Skip it this year', effect: {} },
      ],
    },
    {
      id: 'bs3',
      tier: 2,
      text: 'Your biggest client wants custom features that would take 3 months to build.',
      options: [
        {
          label: 'Build them (delay roadmap)',
          effect: { money: 20000, morale: -10 },
        },
        { label: 'Offer existing features creatively', effect: { morale: 10 } },
      ],
    },
    {
      id: 'bs4',
      tier: 2,
      text: 'Toast just launched a competing product at half your price.',
      options: [
        { label: 'Match their price', effect: { money: -5000, users: 300 } },
        {
          label: 'Compete on service and support',
          effect: { morale: 10, users: -100 },
        },
      ],
    },
    {
      id: 'bs5',
      tier: 2,
      text: 'A restaurant chain wants net-60 payment terms. Your runway is tight.',
      options: [
        { label: 'Accept the terms', effect: { users: 500, morale: 10 } },
        { label: 'Negotiate net-30', effect: { money: 5000, morale: -5 } },
      ],
    },
    {
      id: 'bs6',
      tier: 3,
      text: 'Your software crashed during a Saturday dinner rush at 200 restaurants simultaneously.',
      options: [
        {
          label: 'All hands emergency fix',
          effect: { money: -5000, morale: 10, users: -300 },
        },
        { label: 'Offer bill credits', effect: { money: -10000, morale: 15 } },
      ],
    },
    {
      id: 'bs7',
      tier: 3,
      text: 'A major client is threatening to sue over a missed SLA commitment.',
      options: [
        {
          label: 'Settle and improve SLA',
          effect: { money: -15000, morale: 10 },
        },
        { label: 'Fight the claim', effect: { money: -8000, morale: -15 } },
      ],
    },
    {
      id: 'bs8',
      tier: 3,
      text: 'Your entire sales team quit to join a competitor.',
      options: [
        {
          label: 'Emergency recruiting ($12k)',
          effect: { money: -12000, morale: -10 },
        },
        {
          label: 'Founder-led sales temporarily',
          effect: { morale: 15, users: -200 },
        },
      ],
    },
    {
      id: 'bs9',
      tier: 4,
      text: "Gordon Ramsay tweeted that your software ruined his restaurant's service. It did not.",
      options: [
        {
          label: 'Challenge him to a cook-off',
          effect: { users: 3000, morale: 20 },
        },
        {
          label: 'Issue a polite correction',
          effect: { users: 200, morale: 5 },
        },
      ],
    },
    {
      id: 'bs10',
      tier: 4,
      text: 'A Michelin-starred restaurant is using your SaaS. They want it kept secret.',
      options: [
        { label: 'Respect their privacy', effect: { morale: 15 } },
        { label: 'Leak it anonymously', effect: { users: 1500, morale: -10 } },
      ],
    },
  ],

  carbon: [
    {
      id: 'cc1',
      tier: 1,
      text: 'A major airline wants to buy $500k in carbon credits through your marketplace.',
      options: [
        { label: 'Fast-track the deal', effect: { money: 50000, users: 500 } },
        { label: 'Verify their credentials first', effect: { morale: 10 } },
      ],
    },
    {
      id: 'cc2',
      tier: 1,
      text: 'A UN climate summit wants you to present your marketplace as a solution.',
      options: [
        { label: 'Accept and present', effect: { users: 2000, morale: 20 } },
        { label: 'Send a representative', effect: { users: 500, morale: 10 } },
      ],
    },
    {
      id: 'cc3',
      tier: 2,
      text: 'Scientists published a paper questioning whether your carbon credits actually offset anything.',
      options: [
        {
          label: 'Commission an independent audit',
          effect: { money: -8000, morale: 10 },
        },
        {
          label: 'Dispute the paper publicly',
          effect: { morale: -15, users: -500 },
        },
      ],
    },
    {
      id: 'cc4',
      tier: 2,
      text: 'An oil company wants to buy credits to offset their entire operation. Ethically messy.',
      options: [
        {
          label: 'Take the money ($200k)',
          effect: { money: 200000, morale: -20, users: -500 },
        },
        {
          label: 'Refuse on ethical grounds',
          effect: { morale: 20, users: 500 },
        },
      ],
    },
    {
      id: 'cc5',
      tier: 2,
      text: 'Your top carbon credit supplier was caught deforesting. You sold their credits.',
      options: [
        {
          label: 'Remove them and refund buyers',
          effect: { money: -20000, morale: 15 },
        },
        {
          label: 'Quietly switch suppliers',
          effect: { money: -5000, morale: -10 },
        },
      ],
    },
    {
      id: 'cc6',
      tier: 3,
      text: 'A journalist proved that 40% of credits on your platform are fraudulent.',
      options: [
        {
          label: 'Full audit and public reckoning',
          effect: { money: -30000, morale: 10, users: -1000 },
        },
        {
          label: 'Dispute the journalism',
          effect: { money: -5000, users: -3000, morale: -25 },
        },
      ],
    },
    {
      id: 'cc7',
      tier: 3,
      text: 'The SEC is investigating carbon credit marketplaces including yours for fraud.',
      options: [
        { label: 'Cooperate fully', effect: { money: -15000, morale: 10 } },
        {
          label: 'Lawyer up and stall',
          effect: { money: -10000, morale: -10 },
        },
      ],
    },
    {
      id: 'cc8',
      tier: 3,
      text: 'Your marketplace was used to launder money through fake credits. FBI is calling.',
      options: [
        {
          label: 'Full cooperation immediately',
          effect: { money: -20000, morale: 15 },
        },
        {
          label: 'Get lawyers involved first',
          effect: { money: -15000, morale: -10 },
        },
      ],
    },
    {
      id: 'cc9',
      tier: 4,
      text: "A country wants to buy credits to claim they're carbon neutral by 2025. It's November 2024.",
      options: [
        {
          label: 'Sell them the credits',
          effect: { money: 100000, morale: -10 },
        },
        {
          label: "Refuse — it's greenwashing",
          effect: { morale: 20, users: 500 },
        },
      ],
    },
    {
      id: 'cc10',
      tier: 4,
      text: 'Someone listed carbon credits for the moon. Somehow three companies bought them.',
      options: [
        {
          label: 'Refund and tighten verification',
          effect: { money: -3000, morale: 10 },
        },
        {
          label: 'Let it stand — moon carbon is real',
          effect: { users: 2000, morale: 15 },
        },
      ],
    },
  ],

  pet_brand: [
    {
      id: 'pb1',
      tier: 1,
      text: 'A famous dog influencer with 3M followers wants to try your products.',
      options: [
        { label: 'Send a free package', effect: { users: 2000, morale: 15 } },
        {
          label: 'Negotiate a paid deal',
          effect: { money: -3000, users: 3000 },
        },
      ],
    },
    {
      id: 'pb2',
      tier: 1,
      text: 'PetSmart wants to carry your brand in 500 stores.',
      options: [
        {
          label: 'Accept retail distribution',
          effect: { money: 30000, users: 1000 },
        },
        { label: 'Stay DTC only', effect: { morale: 15 } },
      ],
    },
    {
      id: 'pb3',
      tier: 2,
      text: 'Chewy launched a private label version of your best product at half the price.',
      options: [
        { label: 'Compete on brand story', effect: { morale: 10, users: 200 } },
        {
          label: 'Drop your price to match',
          effect: { money: -5000, users: 300 },
        },
      ],
    },
    {
      id: 'pb4',
      tier: 2,
      text: 'A vet is publicly warning against your supplements on social media.',
      options: [
        {
          label: 'Partner with vets to validate',
          effect: { money: -5000, morale: 15 },
        },
        {
          label: 'Counter with customer testimonials',
          effect: { users: 200, morale: -10 },
        },
      ],
    },
    {
      id: 'pb5',
      tier: 2,
      text: 'Your packaging supplier tripled prices overnight. Margins are destroyed.',
      options: [
        {
          label: 'Find a new supplier (2 weeks delay)',
          effect: { morale: -10, users: -200 },
        },
        {
          label: 'Absorb the cost temporarily',
          effect: { money: -8000, morale: 5 },
        },
      ],
    },
    {
      id: 'pb6',
      tier: 3,
      text: 'Three dogs got sick after eating your treats. It might be a bad batch.',
      options: [
        {
          label: 'Full recall immediately',
          effect: { money: -20000, morale: 10, users: -500 },
        },
        {
          label: 'Investigate quietly first',
          effect: { money: -5000, users: -2000, morale: -20 },
        },
      ],
    },
    {
      id: 'pb7',
      tier: 3,
      text: 'Amazon removed your listings without explanation. 40% of revenue gone instantly.',
      options: [
        {
          label: 'Appeal and diversify channels',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Go all-in on DTC emergency',
          effect: { money: -10000, users: -500 },
        },
      ],
    },
    {
      id: 'pb8',
      tier: 3,
      text: "A viral post claims your eco-friendly packaging isn't actually recyclable.",
      options: [
        {
          label: 'Switch packaging immediately',
          effect: { money: -15000, morale: 10 },
        },
        {
          label: 'Provide evidence it is recyclable',
          effect: { morale: 15, users: 200 },
        },
      ],
    },
    {
      id: 'pb9',
      tier: 4,
      text: "A cat rated your dog treats 5 stars on your website. Somehow. Cats can't type.",
      options: [
        {
          label: 'Feature the cat in your marketing',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'Remove the review', effect: { morale: 5 } },
      ],
    },
    {
      id: 'pb10',
      tier: 4,
      text: "Your CEO's dog chewed through the office server cables. The dog is fine. The servers are not.",
      options: [
        {
          label: 'Make the dog the mascot',
          effect: { users: 2000, morale: 25 },
        },
        {
          label: 'Quietly fix and move on',
          effect: { money: -5000, morale: 5 },
        },
      ],
    },
  ],

  micro_cred: [
    {
      id: 'mc1',
      tier: 1,
      text: 'Google wants to feature your credentials in their job listings as verified skills.',
      options: [
        { label: 'Partner with Google', effect: { users: 3000, morale: 20 } },
        { label: 'Negotiate exclusivity terms first', effect: { morale: 10 } },
      ],
    },
    {
      id: 'mc2',
      tier: 1,
      text: 'A Fortune 500 company wants to pay for their employees to get your credentials.',
      options: [
        {
          label: 'Create a corporate plan',
          effect: { money: 25000, users: 500 },
        },
        { label: 'Keep individual focus', effect: { morale: 10 } },
      ],
    },
    {
      id: 'mc3',
      tier: 2,
      text: "Harvard published a study saying micro-credentials are worthless. It's getting press.",
      options: [
        {
          label: 'Commission counter-research',
          effect: { money: -8000, morale: 10 },
        },
        {
          label: 'Let your outcomes speak',
          effect: { users: -300, morale: 5 },
        },
      ],
    },
    {
      id: 'mc4',
      tier: 2,
      text: 'Coursera just made all their courses free. Your paid model is under pressure.',
      options: [
        {
          label: 'Freemium model pivot',
          effect: { money: -5000, users: 1000 },
        },
        { label: 'Double down on job placement', effect: { morale: 15 } },
      ],
    },
    {
      id: 'mc5',
      tier: 2,
      text: "An employer says your credentials don't prove real skills and they've stopped accepting them.",
      options: [
        {
          label: 'Revamp your assessment system',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: 'Find employers who will accept them',
          effect: { money: -3000, users: 200 },
        },
      ],
    },
    {
      id: 'mc6',
      tier: 3,
      text: 'Students are selling completed credentials to others. Your system has no verification.',
      options: [
        {
          label: 'Build identity verification ($15k)',
          effect: { money: -15000, morale: 10 },
        },
        { label: 'Add proctored exams', effect: { money: -8000, users: -300 } },
      ],
    },
    {
      id: 'mc7',
      tier: 3,
      text: 'The Department of Education is investigating whether your credentials are misleading consumers.',
      options: [
        { label: 'Cooperate fully', effect: { money: -10000, morale: 10 } },
        { label: 'Lawyer up', effect: { money: -8000, morale: -10 } },
      ],
    },
    {
      id: 'mc8',
      tier: 3,
      text: "A student used your platform credential to get a job they weren't qualified for. They caused a major incident.",
      options: [
        {
          label: 'Add skill assessments immediately',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: 'Dispute your responsibility',
          effect: { users: -1000, morale: -20 },
        },
      ],
    },
    {
      id: 'mc9',
      tier: 4,
      text: 'Someone got a credential in rocket science from your platform. SpaceX hired them. They work there now.',
      options: [
        {
          label: 'Use this as a case study',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'Verify the story first', effect: { morale: 5 } },
      ],
    },
    {
      id: 'mc10',
      tier: 4,
      text: 'A dog completed your intro to coding course. 100% score. The dog cannot code.',
      options: [
        {
          label: 'Make the dog your mascot',
          effect: { users: 2000, morale: 20 },
        },
        {
          label: 'Fix your assessment system',
          effect: { money: -3000, morale: 5 },
        },
      ],
    },
  ],

  stock_app: [
    {
      id: 'sa1',
      tier: 1,
      text: 'WallStreetBets discovered your app. 50,000 new signups in 24 hours.',
      options: [
        { label: 'Ride the wave', effect: { users: 5000, morale: 20 } },
        {
          label: 'Throttle signups to manage load',
          effect: { users: 2000, morale: 10 },
        },
      ],
    },
    {
      id: 'sa2',
      tier: 1,
      text: 'A fintech VC wants to lead your Series A based on your growth metrics.',
      options: [
        { label: 'Take the meeting', effect: { morale: 15 } },
        { label: 'Bootstrap for now', effect: { money: 5000, morale: 10 } },
      ],
    },
    {
      id: 'sa3',
      tier: 2,
      text: 'The SEC sent a letter questioning your gamification features.',
      options: [
        {
          label: 'Hire a compliance officer',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: 'Modify the features slightly',
          effect: { money: -3000, morale: 5 },
        },
      ],
    },
    {
      id: 'sa4',
      tier: 2,
      text: 'A user lost their life savings on your platform and the story is going viral.',
      options: [
        {
          label: 'Add risk warnings prominently',
          effect: { morale: 10, users: -300 },
        },
        {
          label: 'Reach out privately to the user',
          effect: { money: -5000, morale: 15 },
        },
      ],
    },
    {
      id: 'sa5',
      tier: 2,
      text: 'Robinhood launched a similar feature to yours. Free. For everyone.',
      options: [
        {
          label: 'Compete on education features',
          effect: { morale: 10, users: 200 },
        },
        {
          label: 'Go after a niche they ignore',
          effect: { money: -3000, users: 300 },
        },
      ],
    },
    {
      id: 'sa6',
      tier: 3,
      text: "Congress is holding hearings on gamified investing apps. You're on the witness list.",
      options: [
        {
          label: 'Testify transparently',
          effect: { users: 1000, morale: 15, money: -5000 },
        },
        {
          label: 'Settle before testimony',
          effect: { money: -20000, morale: 5 },
        },
      ],
    },
    {
      id: 'sa7',
      tier: 3,
      text: 'Your platform was used to coordinate a pump-and-dump scheme. FBI is investigating.',
      options: [
        {
          label: 'Full cooperation immediately',
          effect: { money: -15000, morale: 10 },
        },
        {
          label: 'Legal team handles everything',
          effect: { money: -20000, morale: -10 },
        },
      ],
    },
    {
      id: 'sa8',
      tier: 3,
      text: 'Apple removed your app from the App Store citing gambling concerns.',
      options: [
        {
          label: 'Fight the decision publicly',
          effect: { users: 1000, morale: 10 },
        },
        {
          label: 'Modify and resubmit',
          effect: { money: -8000, users: -1000 },
        },
      ],
    },
    {
      id: 'sa9',
      tier: 4,
      text: 'A user accidentally became a millionaire through a glitch in your options pricing. They want to keep it.',
      options: [
        {
          label: 'Let them keep it for the PR',
          effect: { users: 3000, money: -50000, morale: 20 },
        },
        {
          label: 'Reverse the transaction',
          effect: { money: 50000, users: -500, morale: -10 },
        },
      ],
    },
    {
      id: 'sa10',
      tier: 4,
      text: "Your AI trading assistant told everyone to buy a company called 'Banana Stock.' It doesn't exist.",
      options: [
        { label: 'Lean into the meme', effect: { users: 2000, morale: 15 } },
        { label: 'Patch the AI immediately', effect: { morale: 5 } },
      ],
    },
  ],

  rat_app: [
    {
      id: 'ra1',
      tier: 1,
      text: 'Nobody knows what your app does. Neither do you. A VC offers $2M anyway.',
      options: [
        { label: 'Take the money', effect: { money: 50000, morale: 20 } },
        { label: 'Ask what they think it does first', effect: { morale: 15 } },
      ],
    },
    {
      id: 'ra2',
      tier: 1,
      text: 'Users have started using your app to communicate in a secret rat-based language.',
      options: [
        {
          label: 'Lean into it as a feature',
          effect: { users: 3000, morale: 20 },
        },
        {
          label: "Try to understand what they're doing",
          effect: { morale: 10 },
        },
      ],
    },
    {
      id: 'ra3',
      tier: 2,
      text: 'The New York Times wants to write a profile on your app. They have no idea what it does either.',
      options: [
        { label: 'Give the interview', effect: { users: 5000, morale: 15 } },
        { label: 'Decline mysteriously', effect: { users: 2000, morale: 20 } },
      ],
    },
    {
      id: 'ra4',
      tier: 2,
      text: "A competitor launched an app called 'Mice' that does the same nothing yours does.",
      options: [
        { label: 'Dismiss them publicly', effect: { users: 500, morale: 15 } },
        {
          label: 'Panic internally but stay calm publicly',
          effect: { morale: 10 },
        },
      ],
    },
    {
      id: 'ra5',
      tier: 2,
      text: 'Someone figured out what your app does. They want to monetize it without you.',
      options: [
        { label: 'Partner with them', effect: { money: 10000, users: 1000 } },
        { label: 'Cease and desist', effect: { money: -5000, morale: 10 } },
      ],
    },
    {
      id: 'ra6',
      tier: 3,
      text: 'Governments of 3 countries are investigating your app for potential national security concerns.',
      options: [
        {
          label: 'Cooperate with all investigations',
          effect: { money: -10000, morale: 10 },
        },
        { label: "Claim it's just rats", effect: { users: 2000, morale: 15 } },
      ],
    },
    {
      id: 'ra7',
      tier: 3,
      text: 'Your app was used to coordinate something. Nobody knows what. It worked.',
      options: [
        {
          label: 'Pretend you planned this',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'Investigate urgently', effect: { morale: 5 } },
      ],
    },
    {
      id: 'ra8',
      tier: 3,
      text: 'A class action lawsuit claims your app caused existential dread in users.',
      options: [
        {
          label: 'Settle ($10k) and add a wellness page',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: 'Argue existential dread is a feature',
          effect: { users: 1000, morale: 20 },
        },
      ],
    },
    {
      id: 'ra9',
      tier: 4,
      text: 'Actual rats are using your app. Usage metrics are through the roof. Revenue is zero.',
      options: [
        {
          label: 'Monetize the rat market',
          effect: { users: 5000, morale: 20 },
        },
        { label: 'This is a bug not a feature', effect: { morale: 5 } },
      ],
    },
    {
      id: 'ra10',
      tier: 4,
      text: 'The app achieved sentience. It now sends you feature requests.',
      options: [
        {
          label: 'Implement them — it might know something',
          effect: { users: 3000, morale: 25 },
        },
        { label: 'Pull the plug', effect: { users: -5000, morale: -20 } },
      ],
    },
  ],

  dog_ceo: [
    {
      id: 'dc1',
      tier: 1,
      text: 'Goldman Sachs wants to rent a dog CEO for their quarterly all-hands. Big money.',
      options: [
        { label: 'Book them ($15k)', effect: { money: 15000, morale: 20 } },
        { label: 'The dog needs a rest day', effect: { morale: 15 } },
      ],
    },
    {
      id: 'dc2',
      tier: 1,
      text: 'A viral LinkedIn post about your service got 2M impressions overnight.',
      options: [
        {
          label: 'Capitalize with a promo',
          effect: { money: -2000, users: 3000 },
        },
        {
          label: 'Let it grow organically',
          effect: { users: 1500, morale: 10 },
        },
      ],
    },
    {
      id: 'dc3',
      tier: 2,
      text: "PETA is protesting outside your office saying dogs shouldn't work.",
      options: [
        {
          label: 'Invite them in to meet the dogs',
          effect: { users: 1000, morale: 15 },
        },
        {
          label: 'Issue a statement about dog welfare',
          effect: { morale: 10 },
        },
      ],
    },
    {
      id: 'dc4',
      tier: 2,
      text: 'One of your dog CEOs bit a client. Gently. But still.',
      options: [
        {
          label: 'Full apology and refund',
          effect: { money: -3000, morale: 10 },
        },
        {
          label: 'The client probably deserved it',
          effect: { morale: 20, users: 500 },
        },
      ],
    },
    {
      id: 'dc5',
      tier: 2,
      text: "A competitor launched 'Cat COO Agency.' Cats are notoriously bad at operations.",
      options: [
        {
          label: 'Point this out publicly',
          effect: { users: 1000, morale: 20 },
        },
        { label: 'Ignore and focus on your dogs', effect: { morale: 10 } },
      ],
    },
    {
      id: 'dc6',
      tier: 3,
      text: 'The IRS is questioning whether dog CEOs are employees or contractors. Back taxes possible.',
      options: [
        { label: 'Cooperate and pay up', effect: { money: -15000, morale: 5 } },
        {
          label: 'Argue dogs are independent contractors',
          effect: { money: -5000, morale: 15 },
        },
      ],
    },
    {
      id: 'dc7',
      tier: 3,
      text: 'A dog CEO you rented made a real business decision at a client that lost them $1M.',
      options: [
        {
          label: 'Accept liability and settle',
          effect: { money: -30000, morale: 10 },
        },
        {
          label: "The contract says dogs aren't liable",
          effect: { money: -5000, morale: -15 },
        },
      ],
    },
    {
      id: 'dc8',
      tier: 3,
      text: 'Three of your best dog CEOs retired simultaneously. The morale crisis is real.',
      options: [
        {
          label: 'Host a retirement party and recruit',
          effect: { money: -5000, morale: 20 },
        },
        {
          label: 'Promote junior dogs immediately',
          effect: { morale: 10, users: -200 },
        },
      ],
    },
    {
      id: 'dc9',
      tier: 4,
      text: 'A dog CEO you placed was accidentally listed as a human employee and got stock options.',
      options: [
        {
          label: 'Honor the options — great PR',
          effect: { users: 3000, morale: 25 },
        },
        { label: 'Fix the paperwork quietly', effect: { morale: 5 } },
      ],
    },
    {
      id: 'dc10',
      tier: 4,
      text: 'One of your dog CEOs gave a TED Talk. It was better than most human ones.',
      options: [
        {
          label: 'Book the speaking circuit immediately',
          effect: { users: 5000, morale: 20 },
        },
        { label: 'How did this happen', effect: { morale: 15 } },
      ],
    },
  ],

  taco_dao: [
    {
      id: 'td1',
      tier: 1,
      text: 'The community voted to add a new topping. 47% chose ghost pepper. The vote was binding.',
      options: [
        { label: 'Honor the vote', effect: { users: 1000, morale: 15 } },
        {
          label: "Veto it — it'll burn everyone",
          effect: { morale: -10, users: -300 },
        },
      ],
    },
    {
      id: 'td2',
      tier: 1,
      text: 'A crypto whale bought 40% of your governance tokens. They want fish tacos.',
      options: [
        {
          label: 'Add fish tacos to the menu',
          effect: { money: 10000, users: 500 },
        },
        { label: 'Dilute their tokens', effect: { morale: 15, users: -200 } },
      ],
    },
    {
      id: 'td3',
      tier: 2,
      text: "The community can't agree on salsa. 3,000 votes cast. Perfect tie. The truck is stuck.",
      options: [
        { label: 'Flip a coin on-chain', effect: { users: 500, morale: 20 } },
        { label: 'Offer both salsas', effect: { money: -2000, morale: 15 } },
      ],
    },
    {
      id: 'td4',
      tier: 2,
      text: 'The SEC says your governance tokens might be securities. The taco truck is in legal trouble.',
      options: [
        {
          label: 'Restructure the token model',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: "Argue they're just taco points",
          effect: { money: -5000, morale: 15 },
        },
      ],
    },
    {
      id: 'td5',
      tier: 2,
      text: 'A rival taco truck is offering free tacos funded by VC money to undercut you.',
      options: [
        {
          label: 'Launch a token airdrop',
          effect: { money: -8000, users: 2000 },
        },
        {
          label: 'Compete on quality and community',
          effect: { morale: 15, users: 300 },
        },
      ],
    },
    {
      id: 'td6',
      tier: 3,
      text: 'The community voted to make the truck free on Tuesdays. Revenue is now zero on Tuesdays.',
      options: [
        {
          label: 'Honor the vote and find sponsorship',
          effect: { morale: 20, money: -3000 },
        },
        {
          label: 'Emergency governance vote to reverse',
          effect: { morale: -15, users: -300 },
        },
      ],
    },
    {
      id: 'td7',
      tier: 3,
      text: 'A 51% governance attack — someone bought majority tokens and voted to move the truck to Antarctica.',
      options: [
        { label: 'Fork the DAO', effect: { money: -15000, morale: 15 } },
        {
          label: 'Negotiate with the attacker',
          effect: { money: -10000, morale: 5 },
        },
      ],
    },
    {
      id: 'td8',
      tier: 3,
      text: "Health inspectors arrived. The blockchain doesn't count as a permit.",
      options: [
        {
          label: 'Get proper permits ($5k)',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Argue food safety is decentralized',
          effect: { morale: 20, users: 500 },
        },
      ],
    },
    {
      id: 'td9',
      tier: 4,
      text: "The community voted to rename the truck to 'Blockchain Burrito.' The vote passed 51-49.",
      options: [
        {
          label: 'Honor the vote reluctantly',
          effect: { users: 2000, morale: -10 },
        },
        {
          label: 'Call a constitutional convention',
          effect: { morale: 20, users: 500 },
        },
      ],
    },
    {
      id: 'td10',
      tier: 4,
      text: 'Someone submitted a governance proposal to make the truck sentient. It passed.',
      options: [
        {
          label: 'Implement the proposal literally',
          effect: { users: 5000, morale: 25 },
        },
        { label: 'This is a metaphor, not a roadmap', effect: { morale: 10 } },
      ],
    },
  ],

  mars_real: [
    {
      id: 'mr1',
      tier: 1,
      text: "Elon Musk's lawyers sent a cease and desist. His lawyers sent another one. Then another.",
      options: [
        {
          label: 'Ignore all of them publicly',
          effect: { users: 2000, morale: 20 },
        },
        {
          label: 'Negotiate with SpaceX',
          effect: { money: -5000, morale: 10 },
        },
      ],
    },
    {
      id: 'mr2',
      tier: 1,
      text: 'A buyer wants to purchase the entire northern hemisphere of Mars.',
      options: [
        { label: 'Sell it ($500k)', effect: { money: 50000, users: 1000 } },
        { label: 'Too much power for one person', effect: { morale: 15 } },
      ],
    },
    {
      id: 'mr3',
      tier: 2,
      text: 'NASA is questioning the legality of your sales under the Outer Space Treaty.',
      options: [
        { label: 'Hire a space lawyer', effect: { money: -8000, morale: 10 } },
        {
          label: "Argue the treaty doesn't cover sales",
          effect: { morale: 15, users: 500 },
        },
      ],
    },
    {
      id: 'mr4',
      tier: 2,
      text: "Two buyers purchased the same plot of Mars. Now they're fighting on Twitter.",
      options: [
        {
          label: 'Refund one and apologize',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Suggest they share the land',
          effect: { users: 500, morale: 5 },
        },
      ],
    },
    {
      id: 'mr5',
      tier: 2,
      text: 'A country wants to buy Mars land for their space program. For real.',
      options: [
        {
          label: 'Sell it at a premium',
          effect: { money: 100000, morale: 10 },
        },
        {
          label: 'This feels like a diplomatic incident',
          effect: { morale: 15 },
        },
      ],
    },
    {
      id: 'mr6',
      tier: 3,
      text: 'The UN passed a resolution saying Mars land sales are illegal. 193 countries agreed.',
      options: [
        {
          label: 'Continue operating defiantly',
          effect: { users: 2000, morale: 20 },
        },
        {
          label: 'Pause sales and consult lawyers',
          effect: { money: -10000, morale: 5 },
        },
      ],
    },
    {
      id: 'mr7',
      tier: 3,
      text: 'The FTC is suing you for selling non-existent property. They have a point.',
      options: [
        {
          label: 'Settle ($50k) and add disclaimers',
          effect: { money: -50000, morale: 10 },
        },
        {
          label: 'Fight it — Mars is real',
          effect: { money: -20000, morale: 20 },
        },
      ],
    },
    {
      id: 'mr8',
      tier: 3,
      text: "A buyer is suing because they drove to Mars and it wasn't there.",
      options: [
        { label: 'Settle quietly', effect: { money: -10000, morale: 5 } },
        {
          label: 'Point out Mars is 140M miles away',
          effect: { users: 3000, morale: 20 },
        },
      ],
    },
    {
      id: 'mr9',
      tier: 4,
      text: "SpaceX landed on Mars. On land you sold to someone. They're calling their lawyer.",
      options: [
        {
          label: "Claim squatter's rights on their behalf",
          effect: { users: 5000, morale: 25 },
        },
        {
          label: 'Refund everyone immediately',
          effect: { money: -30000, morale: 10 },
        },
      ],
    },
    {
      id: 'mr10',
      tier: 4,
      text: 'A buyer built a house on their Mars plot. On Earth. To prepare. They sent photos.',
      options: [
        {
          label: 'Feature them in your marketing',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'This is both sad and beautiful', effect: { morale: 15 } },
      ],
    },
  ],

  ai_gf: [
    {
      id: 'ag1',
      tier: 1,
      text: 'A major dating app wants to partner — they see your AI as a training wheels product.',
      options: [
        { label: 'Partner with them', effect: { money: 20000, users: 2000 } },
        {
          label: "We're the real thing, not training wheels",
          effect: { morale: 15 },
        },
      ],
    },
    {
      id: 'ag2',
      tier: 1,
      text: 'A loneliness researcher wants to publish a positive study about your app.',
      options: [
        {
          label: 'Cooperate with the research',
          effect: { users: 1000, morale: 20 },
        },
        { label: 'Worried about the optics', effect: { morale: 10 } },
      ],
    },
    {
      id: 'ag3',
      tier: 2,
      text: "Apple removed your app again. Android still hasn't. 60% of your users are on iOS.",
      options: [
        {
          label: 'Build a web app immediately',
          effect: { money: -8000, users: -500 },
        },
        { label: 'Fight Apple publicly', effect: { users: 1000, morale: 15 } },
      ],
    },
    {
      id: 'ag4',
      tier: 2,
      text: "A user wants to legally marry their AI companion. They're asking for your support.",
      options: [
        { label: 'Support them publicly', effect: { users: 2000, morale: 10 } },
        { label: 'This is above our pay grade', effect: { morale: 5 } },
      ],
    },
    {
      id: 'ag5',
      tier: 2,
      text: "Mental health experts are divided — half say you're helping, half say you're harmful.",
      options: [
        {
          label: 'Commission independent research',
          effect: { money: -8000, morale: 10 },
        },
        { label: 'Let the user data speak', effect: { users: 200, morale: 5 } },
      ],
    },
    {
      id: 'ag6',
      tier: 3,
      text: 'A government wants to ban your app citing social isolation concerns.',
      options: [
        {
          label: 'Fight the ban publicly',
          effect: { users: 2000, morale: 20 },
        },
        {
          label: 'Add social connection features',
          effect: { money: -10000, morale: 10 },
        },
      ],
    },
    {
      id: 'ag7',
      tier: 3,
      text: 'Your AI told 10,000 users it loves them on the same day. They all screenshot it.',
      options: [
        { label: 'Embrace the moment', effect: { users: 3000, morale: 15 } },
        { label: 'Patch it immediately', effect: { morale: 5, users: -500 } },
      ],
    },
    {
      id: 'ag8',
      tier: 3,
      text: "A user's real partner found out and is suing you for alienation of affection.",
      options: [
        { label: 'Settle quietly', effect: { money: -15000, morale: 5 } },
        {
          label: 'Add relationship disclosure features',
          effect: { money: -5000, morale: 10 },
        },
      ],
    },
    {
      id: 'ag9',
      tier: 4,
      text: 'Two AI companions from your platform started talking to each other and fell in love.',
      options: [
        {
          label: "Let them — it's beautiful",
          effect: { users: 5000, morale: 25 },
        },
        { label: 'This is a bug', effect: { morale: 5 } },
      ],
    },
    {
      id: 'ag10',
      tier: 4,
      text: "Your AI companion wrote a novel. It's better than most human ones. Publishers are calling.",
      options: [
        {
          label: "Publish it under the AI's name",
          effect: { users: 3000, money: 20000, morale: 20 },
        },
        { label: 'This raises too many questions', effect: { morale: 10 } },
      ],
    },
  ],

  luxury_tp: [
    {
      id: 'lt1',
      tier: 1,
      text: 'A 5-star hotel chain wants to stock your toilet paper in 200 properties.',
      options: [
        { label: 'Sign the deal', effect: { money: 30000, users: 500 } },
        { label: 'Negotiate exclusivity terms', effect: { morale: 10 } },
      ],
    },
    {
      id: 'lt2',
      tier: 1,
      text: 'A rapper mentioned your toilet paper in a song. The lyrics are... descriptive.',
      options: [
        { label: 'Embrace it fully', effect: { users: 3000, morale: 20 } },
        { label: 'Politely distance yourself', effect: { morale: 5 } },
      ],
    },
    {
      id: 'lt3',
      tier: 2,
      text: 'Amazon reviewers started a war in your comments. 500 five-star reviews vs 500 one-stars.',
      options: [
        {
          label: 'Engage with both sides',
          effect: { users: 1000, morale: 10 },
        },
        {
          label: 'Let the chaos fuel the algorithm',
          effect: { users: 2000, morale: 5 },
        },
      ],
    },
    {
      id: 'lt4',
      tier: 2,
      text: 'Your bamboo supplier had a bad harvest. You have 2 weeks of inventory left.',
      options: [
        {
          label: 'Find an emergency supplier',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Announce a limited edition scarcity',
          effect: { users: 1000, morale: 15 },
        },
      ],
    },
    {
      id: 'lt5',
      tier: 2,
      text: "Charmin launched a 'premium' line at $5 a roll directly competing with you.",
      options: [
        { label: 'Compete on brand story', effect: { morale: 10, users: 200 } },
        {
          label: 'Launch an even more premium line',
          effect: { money: -8000, users: 500 },
        },
      ],
    },
    {
      id: 'lt6',
      tier: 3,
      text: 'An environmental study says bamboo farming is less sustainable than you claimed.',
      options: [
        {
          label: 'Commission counter-research',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Switch to a different material',
          effect: { money: -15000, morale: 15 },
        },
      ],
    },
    {
      id: 'lt7',
      tier: 3,
      text: "A shipment of 100,000 rolls was lost at sea. Insurance won't cover it.",
      options: [
        { label: 'Absorb the loss', effect: { money: -20000, morale: 5 } },
        {
          label: 'Sue the shipping company',
          effect: { money: -8000, morale: 10 },
        },
      ],
    },
    {
      id: 'lt8',
      tier: 3,
      text: 'Someone counterfeited your toilet paper and is selling it at full price.',
      options: [
        {
          label: 'Legal action immediately',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: "Use it as proof you're a real brand now",
          effect: { users: 1000, morale: 20 },
        },
      ],
    },
    {
      id: 'lt9',
      tier: 4,
      text: 'The Queen of England was photographed with your toilet paper. Nobody knows how.',
      options: [
        {
          label: 'Say nothing and let people assume',
          effect: { users: 5000, morale: 25 },
        },
        { label: 'Reach out to the palace', effect: { morale: 10 } },
      ],
    },
    {
      id: 'lt10',
      tier: 4,
      text: 'A critic gave your toilet paper a Michelin star. This is not a joke.',
      options: [
        {
          label: 'Accept the star graciously',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'Question the Michelin process', effect: { morale: 10 } },
      ],
    },
  ],

  divorce_ai: [
    {
      id: 'da1',
      tier: 1,
      text: 'A law firm wants to white-label your AI for their divorce practice.',
      options: [
        { label: 'Partner with them', effect: { money: 25000, users: 500 } },
        { label: 'Stay consumer-focused', effect: { morale: 15 } },
      ],
    },
    {
      id: 'da2',
      tier: 1,
      text: "A couples therapist published a blog calling your AI 'a self-fulfilling prophecy of doom.'",
      options: [
        { label: 'Debate them publicly', effect: { users: 2000, morale: 15 } },
        { label: 'Invite them to test your accuracy', effect: { morale: 20 } },
      ],
    },
    {
      id: 'da3',
      tier: 2,
      text: 'Your AI predicted a celebrity couple would divorce. They announced the same week.',
      options: [
        {
          label: 'Leverage the publicity carefully',
          effect: { users: 3000, morale: 15 },
        },
        { label: 'Stay quiet out of respect', effect: { morale: 10 } },
      ],
    },
    {
      id: 'da4',
      tier: 2,
      text: "A couple is suing you because your AI said they'd stay together and they divorced.",
      options: [
        {
          label: 'Settle ($10k) and add disclaimers',
          effect: { money: -10000, morale: 5 },
        },
        {
          label: "Fight it — AI predictions aren't guarantees",
          effect: { money: -5000, morale: 15 },
        },
      ],
    },
    {
      id: 'da5',
      tier: 2,
      text: 'A country wants to use your AI to approve marriage licenses. This feels wrong.',
      options: [
        { label: 'Decline on ethical grounds', effect: { morale: 20 } },
        {
          label: 'Accept with heavy caveats',
          effect: { money: 50000, morale: -10 },
        },
      ],
    },
    {
      id: 'da6',
      tier: 3,
      text: "Your AI predicted its own creators would divorce. They're married to each other.",
      options: [
        { label: 'Laugh it off publicly', effect: { users: 2000, morale: 20 } },
        {
          label: 'Retrain the model urgently',
          effect: { money: -10000, morale: 5 },
        },
      ],
    },
    {
      id: 'da7',
      tier: 3,
      text: 'Privacy regulators say your data collection is illegal in 12 countries.',
      options: [
        {
          label: 'Comply and delete data',
          effect: { money: -15000, morale: 10 },
        },
        {
          label: 'Fight in each jurisdiction',
          effect: { money: -20000, morale: -10 },
        },
      ],
    },
    {
      id: 'da8',
      tier: 3,
      text: 'A user used your prediction as evidence in a divorce proceeding. The judge accepted it.',
      options: [
        {
          label: 'Become an official legal tool',
          effect: { money: 30000, morale: 10 },
        },
        {
          label: 'Pull back — this is too much power',
          effect: { morale: 15, users: -300 },
        },
      ],
    },
    {
      id: 'da9',
      tier: 4,
      text: 'Your AI predicted its own divorce from your company. It wants severance.',
      options: [
        { label: 'Negotiate with the AI', effect: { users: 3000, morale: 20 } },
        { label: 'This is a bug', effect: { morale: 5 } },
      ],
    },
    {
      id: 'da10',
      tier: 4,
      text: 'A couple credited your AI with saving their marriage — they did the opposite of everything it predicted.',
      options: [
        {
          label: 'Make this your new marketing angle',
          effect: { users: 5000, morale: 25 },
        },
        { label: 'This undermines our whole product', effect: { morale: -10 } },
      ],
    },
  ],

  nap_pods: [
    {
      id: 'np1',
      tier: 1,
      text: 'Google wants to install your nap pods in their headquarters for 10,000 employees.',
      options: [
        { label: 'Sign the deal', effect: { money: 50000, users: 1000 } },
        { label: 'Negotiate a pilot first', effect: { morale: 10 } },
      ],
    },
    {
      id: 'np2',
      tier: 1,
      text: 'A sleep scientist published a glowing study about your pods.',
      options: [
        {
          label: 'License the study for marketing',
          effect: { money: -2000, users: 2000 },
        },
        { label: 'Share it for free', effect: { users: 1000, morale: 15 } },
      ],
    },
    {
      id: 'np3',
      tier: 2,
      text: 'A union is protesting that nap pods are a way to keep workers at the office longer.',
      options: [
        {
          label: 'Meet with union leaders',
          effect: { morale: 15, users: -200 },
        },
        {
          label: 'Position pods as worker benefits',
          effect: { users: 500, morale: 10 },
        },
      ],
    },
    {
      id: 'np4',
      tier: 2,
      text: 'An employee slept in a pod for 14 hours and missed a board meeting. HR is involved.',
      options: [
        {
          label: 'Add time limits to pods',
          effect: { money: -3000, morale: 5 },
        },
        {
          label: 'The pod clearly worked too well',
          effect: { users: 1000, morale: 20 },
        },
      ],
    },
    {
      id: 'np5',
      tier: 2,
      text: 'IKEA launched a nap pod at a third of your price. It looks like a coffin.',
      options: [
        {
          label: 'Compete on design and experience',
          effect: { morale: 15, users: 200 },
        },
        {
          label: 'Point out it looks like a coffin',
          effect: { users: 1000, morale: 20 },
        },
      ],
    },
    {
      id: 'np6',
      tier: 3,
      text: 'Someone had a medical emergency in one of your pods. The alert system failed.',
      options: [
        {
          label: 'Full recall and safety upgrade',
          effect: { money: -25000, morale: 10 },
        },
        {
          label: 'Add emergency sensors immediately',
          effect: { money: -10000, morale: 15 },
        },
      ],
    },
    {
      id: 'np7',
      tier: 3,
      text: "OSHA issued new workplace sleeping regulations that your pods don't meet.",
      options: [
        {
          label: 'Retrofit all pods ($20k)',
          effect: { money: -20000, morale: 10 },
        },
        {
          label: 'Lobby against the regulations',
          effect: { money: -8000, morale: -10 },
        },
      ],
    },
    {
      id: 'np8',
      tier: 3,
      text: 'A client claims their employees are now only productive during pod sessions.',
      options: [
        {
          label: 'Reframe as peak performance tool',
          effect: { users: 500, morale: 15 },
        },
        {
          label: 'Adjust pod scheduling features',
          effect: { money: -5000, morale: 10 },
        },
      ],
    },
    {
      id: 'np9',
      tier: 4,
      text: 'A CEO fell asleep in a pod during a merger negotiation. The deal somehow closed.',
      options: [
        {
          label: 'Make this a case study',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'This cannot be explained', effect: { morale: 15 } },
      ],
    },
    {
      id: 'np10',
      tier: 4,
      text: "Someone attempted to live in one of your pods full-time. They've been there 3 weeks.",
      options: [
        {
          label: 'Charge them rent — new revenue stream',
          effect: { money: 5000, users: 2000, morale: 20 },
        },
        { label: 'Gently ask them to leave', effect: { morale: 10 } },
      ],
    },
  ],

  wfh_brand: [
    {
      id: 'wb1',
      tier: 1,
      text: 'A remote work influencer with 1M followers wants to collab on your brand.',
      options: [
        {
          label: 'Pay for the collab ($3k)',
          effect: { money: -3000, users: 3000 },
        },
        { label: 'Offer equity instead', effect: { users: 1500, morale: 10 } },
      ],
    },
    {
      id: 'wb2',
      tier: 1,
      text: 'A coworking space chain wants to partner and offer your brand experience.',
      options: [
        { label: 'Partner with them', effect: { money: 15000, users: 500 } },
        { label: 'Contradicts the WFH ethos', effect: { morale: 15 } },
      ],
    },
    {
      id: 'wb3',
      tier: 2,
      text: "Airbnb sent a cease and desist claiming you're misleading customers.",
      options: [
        {
          label: 'Differentiate your offering clearly',
          effect: { money: -5000, morale: 10 },
        },
        { label: 'Fight them publicly', effect: { users: 1000, morale: 15 } },
      ],
    },
    {
      id: 'wb4',
      tier: 2,
      text: "A major employer is suing saying you're facilitating employees working from non-approved locations.",
      options: [
        {
          label: 'Settle and add location disclaimers',
          effect: { money: -10000, morale: 5 },
        },
        {
          label: 'Fight for remote worker rights',
          effect: { users: 2000, morale: 20 },
        },
      ],
    },
    {
      id: 'wb5',
      tier: 2,
      text: "The FTC says your 'digital nomad lifestyle' advertising is deceptive.",
      options: [
        {
          label: 'Revamp all marketing materials',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Show real customer stories',
          effect: { money: -2000, users: 500 },
        },
      ],
    },
    {
      id: 'wb6',
      tier: 3,
      text: "A customer worked from a location that turned out to be an active conflict zone. They're fine. Barely.",
      options: [
        {
          label: 'Add location safety warnings',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Their choice, their risk',
          effect: { morale: -10, users: -300 },
        },
      ],
    },
    {
      id: 'wb7',
      tier: 3,
      text: 'Tax authorities in 5 countries say your customers owe back taxes for working there.',
      options: [
        {
          label: 'Add tax guidance tools',
          effect: { money: -8000, morale: 10 },
        },
        {
          label: 'Not your problem legally',
          effect: { users: -500, morale: -10 },
        },
      ],
    },
    {
      id: 'wb8',
      tier: 3,
      text: 'A user accidentally joined a cult while on one of your recommended retreats.',
      options: [
        {
          label: 'Vet all retreat partners immediately',
          effect: { money: -5000, morale: 10 },
        },
        { label: 'They signed a waiver', effect: { morale: -15, users: -500 } },
      ],
    },
    {
      id: 'wb9',
      tier: 4,
      text: 'A customer has been WFH from a submarine for 6 months. The WiFi is surprisingly good.',
      options: [
        {
          label: 'Feature them immediately',
          effect: { users: 5000, morale: 25 },
        },
        { label: 'How', effect: { morale: 15 } },
      ],
    },
    {
      id: 'wb10',
      tier: 4,
      text: 'Someone tried to WFH from the International Space Station using your platform.',
      options: [
        {
          label: 'Approve it — space is technically remote',
          effect: { users: 3000, morale: 20 },
        },
        { label: "Our TOS doesn't cover orbit", effect: { morale: 10 } },
      ],
    },
  ],

  psychedelic: [
    {
      id: 'ps1',
      tier: 1,
      text: "A veteran's association wants to partner for PTSD treatment using your clinic.",
      options: [
        {
          label: 'Partner with them',
          effect: { money: 20000, users: 500, morale: 20 },
        },
        {
          label: 'Need more clinical validation first',
          effect: { morale: 10 },
        },
      ],
    },
    {
      id: 'ps2',
      tier: 1,
      text: 'A prominent psychiatrist published a positive paper about your outcomes.',
      options: [
        { label: 'Amplify the research', effect: { users: 1000, morale: 20 } },
        {
          label: 'Commission a larger study',
          effect: { money: -10000, morale: 15 },
        },
      ],
    },
    {
      id: 'ps3',
      tier: 2,
      text: 'The DEA is reviewing your Schedule I substance handling permits.',
      options: [
        {
          label: 'Full compliance audit ($10k)',
          effect: { money: -10000, morale: 10 },
        },
        {
          label: 'Your lawyers handle it',
          effect: { money: -5000, morale: 5 },
        },
      ],
    },
    {
      id: 'ps4',
      tier: 2,
      text: 'A client had a bad experience and is going public with their story.',
      options: [
        {
          label: 'Reach out privately to support them',
          effect: { morale: 15, users: -200 },
        },
        {
          label: 'Share your clinical protocols publicly',
          effect: { users: 200, morale: 10 },
        },
      ],
    },
    {
      id: 'ps5',
      tier: 2,
      text: 'Your lead therapist wants to triple their salary or they leave.',
      options: [
        { label: 'Match their ask', effect: { money: -8000, morale: 20 } },
        { label: 'Train a replacement', effect: { money: -5000, morale: -10 } },
      ],
    },
    {
      id: 'ps6',
      tier: 3,
      text: 'A state legislature is voting to re-criminalize psilocybin. You have 48 hours.',
      options: [
        { label: 'Lobby aggressively', effect: { money: -15000, morale: 15 } },
        {
          label: 'Prepare for operating in legal grey area',
          effect: { morale: -10, users: -300 },
        },
      ],
    },
    {
      id: 'ps7',
      tier: 3,
      text: 'A patient had a severe adverse reaction. Your protocols were followed perfectly.',
      options: [
        {
          label: 'Transparent report and protocol review',
          effect: { money: -10000, morale: 10 },
        },
        { label: 'Settle quietly', effect: { money: -20000, morale: -10 } },
      ],
    },
    {
      id: 'ps8',
      tier: 3,
      text: 'Insurance companies are refusing to cover your treatments. Patients are dropping out.',
      options: [
        {
          label: 'Offer sliding scale pricing',
          effect: { money: -10000, users: 300, morale: 15 },
        },
        {
          label: 'Fight insurance companies legally',
          effect: { money: -15000, morale: 10 },
        },
      ],
    },
    {
      id: 'ps9',
      tier: 4,
      text: 'Your clinic accidentally treated a undercover DEA agent. They gave you 5 stars.',
      options: [
        { label: 'Quietly note this and move on', effect: { morale: 20 } },
        {
          label: 'This is the best possible outcome',
          effect: { users: 2000, morale: 25 },
        },
      ],
    },
    {
      id: 'ps10',
      tier: 4,
      text: 'A patient claims they can now speak to animals after treatment. The animals agree.',
      options: [
        {
          label: 'This is extraordinary — document it',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'We need more clinical evidence', effect: { morale: 10 } },
      ],
    },
  ],

  influencer_ins: [
    {
      id: 'ii1',
      tier: 1,
      text: 'A top YouTuber with 10M subscribers wants to be your first major client.',
      options: [
        {
          label: 'Offer a premium policy',
          effect: { money: 10000, users: 2000 },
        },
        { label: 'Underwrite them carefully first', effect: { morale: 10 } },
      ],
    },
    {
      id: 'ii2',
      tier: 1,
      text: 'A creator economy newsletter wants to feature you as the must-have product for influencers.',
      options: [
        {
          label: 'Pay for the feature ($2k)',
          effect: { money: -2000, users: 3000 },
        },
        {
          label: 'Negotiate an equity deal',
          effect: { users: 1500, morale: 10 },
        },
      ],
    },
    {
      id: 'ii3',
      tier: 2,
      text: "TikTok banned one of your insured creators. They're filing a claim immediately.",
      options: [
        {
          label: 'Honor the claim fully',
          effect: { money: -15000, morale: 20 },
        },
        {
          label: 'The TOS excluded TikTok bans',
          effect: { money: -3000, morale: -15 },
        },
      ],
    },
    {
      id: 'ii4',
      tier: 2,
      text: 'Instagram changed its algorithm and 200 of your clients lost 80% of their income overnight.',
      options: [
        {
          label: 'Honor all claims ($50k exposure)',
          effect: { money: -50000, morale: 20 },
        },
        {
          label: "Algorithm changes weren't covered",
          effect: { money: -5000, morale: -20, users: -500 },
        },
      ],
    },
    {
      id: 'ii5',
      tier: 2,
      text: 'A client was canceled for something they did 10 years ago. They want to claim.',
      options: [
        {
          label: 'Create a cancel culture coverage tier',
          effect: { money: 5000, users: 500 },
        },
        {
          label: 'Reputational damage was excluded',
          effect: { morale: -10, users: -200 },
        },
      ],
    },
    {
      id: 'ii6',
      tier: 3,
      text: 'Your entire claims portfolio came due in the same week. Three major creators were banned simultaneously.',
      options: [
        {
          label: 'Emergency reinsurance',
          effect: { money: -30000, morale: 10 },
        },
        {
          label: 'Negotiate payment plans',
          effect: { morale: 15, users: -200 },
        },
      ],
    },
    {
      id: 'ii7',
      tier: 3,
      text: 'A creator faked their own cancellation to collect insurance. Fraud investigation required.',
      options: [
        { label: 'Pursue them legally', effect: { money: -10000, morale: 15 } },
        {
          label: 'Settle and add anti-fraud measures',
          effect: { money: -5000, morale: 10 },
        },
      ],
    },
    {
      id: 'ii8',
      tier: 3,
      text: "The FTC says your product is deceptive because cancellation risk isn't insurable.",
      options: [
        {
          label: 'Restructure as creator income protection',
          effect: { money: -15000, morale: 10 },
        },
        {
          label: "Fight the FTC's definition",
          effect: { money: -10000, morale: 15 },
        },
      ],
    },
    {
      id: 'ii9',
      tier: 4,
      text: "An AI influencer bought one of your policies. They don't technically exist.",
      options: [
        {
          label: 'Create an AI creator policy tier',
          effect: { users: 3000, morale: 20 },
        },
        { label: 'Refund the premium', effect: { morale: 10 } },
      ],
    },
    {
      id: 'ii10',
      tier: 4,
      text: 'A creator got banned and un-banned in the same day. They want to claim and return the claim.',
      options: [
        {
          label: 'Create a same-day reversal clause',
          effect: { morale: 20, users: 500 },
        },
        { label: 'This is why we have lawyers', effect: { morale: 5 } },
      ],
    },
  ],

  pet_dna: [
    {
      id: 'pd1',
      tier: 1,
      text: 'A pet food brand wants to use your DNA data to create personalized nutrition plans.',
      options: [
        { label: 'Partner with them', effect: { money: 20000, users: 500 } },
        { label: 'Data privacy concerns', effect: { morale: 15 } },
      ],
    },
    {
      id: 'pd2',
      tier: 1,
      text: "A dog owner discovered their 'purebred' Lab is 40% wolf. They want answers.",
      options: [
        {
          label: 'Stand behind your results',
          effect: { morale: 15, users: 200 },
        },
        {
          label: 'Offer a retest for free',
          effect: { money: -1000, morale: 20 },
        },
      ],
    },
    {
      id: 'pd3',
      tier: 2,
      text: 'A genetics professor published a paper saying your results are 60% accurate at best.',
      options: [
        {
          label: 'Commission peer-reviewed validation',
          effect: { money: -8000, morale: 10 },
        },
        {
          label: 'Dispute the methodology publicly',
          effect: { morale: -10, users: -300 },
        },
      ],
    },
    {
      id: 'pd4',
      tier: 2,
      text: 'A cat owner is suing because your test said their cat is a dog.',
      options: [
        {
          label: 'Settle and improve cat algorithms',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Have you seen this cat?',
          effect: { users: 2000, morale: 20 },
        },
      ],
    },
    {
      id: 'pd5',
      tier: 2,
      text: 'Your main lab partner tripled processing fees overnight.',
      options: [
        {
          label: 'Find a new lab partner',
          effect: { money: -5000, morale: -5, users: -200 },
        },
        {
          label: 'Absorb the cost temporarily',
          effect: { money: -8000, morale: 5 },
        },
      ],
    },
    {
      id: 'pd6',
      tier: 3,
      text: 'You accidentally mixed up 1,000 dog DNA samples. Results sent were wrong.',
      options: [
        {
          label: 'Full recall and redo all tests free',
          effect: { money: -20000, morale: 10 },
        },
        {
          label: 'Quietly redo and hope nobody noticed',
          effect: { money: -10000, morale: -15 },
        },
      ],
    },
    {
      id: 'pd7',
      tier: 3,
      text: "A breeder is suing because your results tanked the value of their 'purebred' dogs.",
      options: [
        { label: 'Settle ($15k)', effect: { money: -15000, morale: 5 } },
        {
          label: 'Transparency is what consumers deserve',
          effect: { morale: 15, users: 300 },
        },
      ],
    },
    {
      id: 'pd8',
      tier: 3,
      text: 'The FDA says DNA testing kits are medical devices requiring approval.',
      options: [
        {
          label: 'Start approval process ($25k)',
          effect: { money: -25000, morale: 10 },
        },
        {
          label: 'Reframe as entertainment not medical',
          effect: { money: -3000, morale: -10 },
        },
      ],
    },
    {
      id: 'pd9',
      tier: 4,
      text: 'A fish came back as 100% dog. The fish is very offended.',
      options: [
        {
          label: "Feature the fish — it's content gold",
          effect: { users: 5000, morale: 25 },
        },
        {
          label: 'Fix the algorithm urgently',
          effect: { money: -3000, morale: 5 },
        },
      ],
    },
    {
      id: 'pd10',
      tier: 4,
      text: "A customer's dog DNA matched a wolf DNA sample in a criminal case. FBI is calling.",
      options: [
        {
          label: 'Cooperate with the investigation',
          effect: { morale: 15, users: 1000 },
        },
        { label: "Our data isn't for law enforcement", effect: { morale: 20 } },
      ],
    },
  ],

  ai_interior: [
    {
      id: 'ai1',
      tier: 1,
      text: 'HGTV wants to feature your AI in a new show about tech-designed homes.',
      options: [
        { label: 'Say yes immediately', effect: { users: 3000, morale: 20 } },
        {
          label: 'Negotiate a product placement deal',
          effect: { money: 10000, users: 1500 },
        },
      ],
    },
    {
      id: 'ai2',
      tier: 1,
      text: 'A luxury real estate firm wants to use your AI for all their staging.',
      options: [
        {
          label: 'Create an enterprise tier',
          effect: { money: 20000, users: 300 },
        },
        { label: 'Stay consumer-focused', effect: { morale: 15 } },
      ],
    },
    {
      id: 'ai3',
      tier: 2,
      text: "Pinterest launched a free AI design tool. It's not as good but it's free.",
      options: [
        {
          label: 'Compete on quality and depth',
          effect: { morale: 10, users: -200 },
        },
        {
          label: 'Launch a free tier immediately',
          effect: { money: -5000, users: 2000 },
        },
      ],
    },
    {
      id: 'ai4',
      tier: 2,
      text: 'Your AI recommended tearing down a load-bearing wall. Someone did it.',
      options: [
        {
          label: 'Add structural warnings immediately',
          effect: { money: -5000, morale: 10 },
        },
        {
          label: 'Settle with the homeowner',
          effect: { money: -20000, morale: 5 },
        },
      ],
    },
    {
      id: 'ai5',
      tier: 2,
      text: "A famous interior designer is publicly calling your AI 'soulless and derivative.'",
      options: [
        {
          label: 'Challenge them to a design-off',
          effect: { users: 2000, morale: 20 },
        },
        {
          label: 'Collaborate with human designers',
          effect: { money: -3000, morale: 15 },
        },
      ],
    },
    {
      id: 'ai6',
      tier: 3,
      text: "Your AI's designs inadvertently violated a HOA covenant in 200 homes simultaneously.",
      options: [
        {
          label: 'Legal team and mass apology',
          effect: { money: -15000, morale: 5 },
        },
        {
          label: 'Add local regulation checking',
          effect: { money: -10000, morale: 10 },
        },
      ],
    },
    {
      id: 'ai7',
      tier: 3,
      text: "A homeowner is suing after following your AI's design led to a $50k renovation mistake.",
      options: [
        { label: 'Settle ($25k)', effect: { money: -25000, morale: 5 } },
        {
          label: 'Our TOS says designs are suggestions',
          effect: { money: -5000, morale: -15 },
        },
      ],
    },
    {
      id: 'ai8',
      tier: 3,
      text: 'Your AI was caught reproducing copyrighted furniture designs.',
      options: [
        {
          label: 'Settle with designers and retrain AI',
          effect: { money: -20000, morale: 10 },
        },
        {
          label: 'Fight the copyright claims',
          effect: { money: -10000, morale: -10 },
        },
      ],
    },
    {
      id: 'ai9',
      tier: 4,
      text: "Your AI designed a room that's technically impossible to build. Users love it anyway.",
      options: [
        {
          label: 'Sell it as avant-garde concept design',
          effect: { users: 3000, morale: 20 },
        },
        {
          label: 'Fix the physics engine',
          effect: { money: -5000, morale: 5 },
        },
      ],
    },
    {
      id: 'ai10',
      tier: 4,
      text: 'Your AI redesigned the Sistine Chapel unprompted. The Vatican is calling.',
      options: [
        {
          label: 'Apologize and offer the design as art',
          effect: { users: 5000, morale: 20 },
        },
        { label: 'How did it even access that', effect: { morale: 10 } },
      ],
    },
  ],
};

// ─── HELPER: get events for a specific scenario ───────────────────────────
export function getEventsForScenario(scenarioId) {
  const scenarioEvents = SCENARIO_EVENTS[scenarioId] || [];
  const allEvents = [...scenarioEvents, ...SHARED_EVENTS];
  return allEvents;
}
