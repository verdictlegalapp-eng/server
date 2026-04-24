const { User, Lawyer } = require('../models');
const { sequelize } = require('../config/db');

const SAMPLE_LAWYERS = [
  {
    name: "Eleanor Sterling",
    email: "eleanor@sterlinglaw.com",
    practice: "Corporate & Startup Law",
    experience: 12,
    location: "New York, NY",
    city: "New York",
    state: "NY",
    bio: "I specialize in helping founders navigate early-stage growth, venture rounds, and IP protection. Let's make sure your startup is built on a solid foundation.",
    badges: ["10+ Years Experience", "Free Consultation", "Bar Verified"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Marcus Reid",
    email: "marcus@reidprivacy.com",
    practice: "Tech & Privacy Law",
    experience: 8,
    location: "San Francisco, CA",
    city: "San Francisco",
    state: "CA",
    bio: "Former tech founder turned attorney. I understand the fast-paced nature of software development. Specializing in data privacy, terms of service, and compliance.",
    badges: ["Tech Industry Focus", "Bar Verified", "Quick Response"],
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sarah Jenkins",
    email: "sarah@jenkinslegal.com",
    practice: "Criminal Defense",
    experience: 15,
    location: "Chicago, IL",
    city: "Chicago",
    state: "IL",
    bio: "Former prosecutor with over a decade of trial experience. I know how the other side thinks, and I use that to get the best outcomes for my clients.",
    badges: ["Former Prosecutor", "Trial Tested", "Bar Verified"],
    image: "https://images.unsplash.com/photo-1580820267682-426da823d514?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "David Chen",
    email: "david@chenip.com",
    practice: "Intellectual Property",
    experience: 5,
    location: "Austin, TX",
    city: "Austin",
    state: "TX",
    bio: "Protecting your brand and ideas. Expertise in patents, trademarks, and copyright law for creators and innovators.",
    badges: ["Top Rated", "Free Consultation"],
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sophia Martinez",
    email: "sophia@martinezfamily.com",
    practice: "Family & Divorce Law",
    experience: 10,
    location: "Miami, FL",
    city: "Miami",
    state: "FL",
    bio: "Compassionate representation for life's toughest transitions. I focus on mediation and fair outcomes for families and children.",
    badges: ["Mediation Expert", "Top 100 Attorneys", "Bar Verified"],
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "James Wilson",
    email: "james@wilsoninjury.com",
    practice: "Personal Injury",
    experience: 20,
    location: "Los Angeles, CA",
    city: "Los Angeles",
    state: "CA",
    bio: "Fighting for the compensation you deserve. Over $50M recovered for clients. We don't get paid unless you win.",
    badges: ["20+ Years Experience", "High Recovery Rate", "Bar Verified"],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Linda Thompson",
    email: "linda@thompsonestates.com",
    practice: "Estate Planning",
    experience: 7,
    location: "Seattle, WA",
    city: "Seattle",
    state: "WA",
    bio: "Securing your legacy and protecting your loved ones. Expert in wills, trusts, and probate law.",
    badges: ["Legacy Focus", "Client Recommended", "Bar Verified"],
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800",
  }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection established for seeding.');

        for (const data of SAMPLE_LAWYERS) {
            // Find or Create User
            const [user, created] = await User.findOrCreate({
                where: { email: data.email },
                defaults: {
                    name: data.name,
                    role: 'lawyer',
                    image: data.image,
                    city: data.city,
                    state: data.state
                }
            });

            if (created || user) {
                // Find or Create Lawyer Profile
                await Lawyer.findOrCreate({
                    where: { userId: user.id },
                    defaults: {
                        practice: data.practice,
                        experience: `${data.experience} Years Licensed`,
                        city: data.city,
                        state: data.state,
                        location: data.location,
                        bio: data.bio,
                        badges: data.badges,
                        rating: 4.5 + Math.random() * 0.5
                    }
                });
                console.log(`${created ? '✅ Created' : 'ℹ️ Exists'}: ${data.name}`);
            }
        }

        console.log('🚀 Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
