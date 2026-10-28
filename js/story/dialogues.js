/**
 * COLONY KERNEL: MARS - NPC Dialogue Trees & Friendship Interactions
 * Rich humorous and insightful dialogues for all 10 colony members.
 */

const NPC_DIALOGUES = {
    maya: {
        greeting: "Welcome to the central spire. Please tell me you didn't schedule cargo sorting before oxygen again.",
        topics: [
            {
                text: "How does the Kernel OS dispatch work?",
                response: "Press [TAB] at any time. You have 4 CPU cores. If an emergency task arrives, don't hesitate to preempt lower-priority batch processes.",
                rewardXP: 20
            },
            {
                text: "Any tips on avoiding CPU bottlenecks?",
                response: "Keep an eye on core loads. If all 4 cores are locked on 100% burst tasks, incoming alarms get queued. Balance high and medium priority threads.",
                rewardXP: 25
            },
            {
                text: "You look like you need a coffee.",
                response: "Finn made algae-cappuccino today. It smells like rocket fuel, but it keeps my synapses firing. Thanks for asking.",
                rewardXP: 30,
                friendship: 15
            }
        ]
    },
    arjun: {
        greeting: "Relax! I've got the power grid! ...Mostly. Well, as long as the solar arrays don't get covered in dust.",
        topics: [
            {
                text: "How are the solar panels holding up?",
                response: "They need manual calibration every few Sols. If solar power drops, head over to the array and run the alignment minigame!",
                rewardXP: 20
            },
            {
                text: "What happens if power hits 0%?",
                response: "The oxygen plant immediately trips offline, followed by the cryo-bay. That's a textbook cascade failure. Let's avoid that, yeah?",
                rewardXP: 25
            },
            {
                text: "High-five, Arjun!",
                response: "*Smacks your astronaut glove* That's the spirit! Solar energy to the moon... I mean, to Mars!",
                rewardXP: 30,
                friendship: 20
            }
        ]
    },
    lena: {
        greeting: "Oxygen levels are currently stable. Remember: humans require continuous air supply, unlike your CPU cores.",
        topics: [
            {
                text: "How do we prevent O2 leaks?",
                response: "Keep the Life Support processes running on Core 01 or Core 02. If pipes rupture, seal the valves quickly at the Oxygen Sector.",
                rewardXP: 20
            },
            {
                text: "How is the crew doing emotionally?",
                response: "Colony happiness rises when systems are steady and people get to play arcade games or chat. Keep happiness above 70%!",
                rewardXP: 25
            },
            {
                text: "You do an amazing job keeping us alive, Lena.",
                response: "Thank you. That means a lot. Being millions of miles from Earth isn't easy, but we've got each other.",
                rewardXP: 35,
                friendship: 25
            }
        ]
    },
    noah: {
        greeting: "Good news: Communications are back! Bad news: I accidentally sent a ping to an old Earth TV broadcast satellite.",
        topics: [
            {
                text: "What are you listening to?",
                response: "Old synthwave broadcasts and telemetry pings. Did you know Earth has something called 'traffic jams'? Sounds like a deadlock!",
                rewardXP: 20
            },
            {
                text: "Can we calibrate the Earth uplink?",
                response: "Sure! Walk up to the Comms Dish and match the harmonic wave frequencies. Earth loves receiving our OS telemetry logs.",
                rewardXP: 25
            }
        ]
    },
    kai: {
        greeting: "I fixed it.",
        topics: [
            {
                text: "What did you fix?",
                response: "...Something. Maybe a hydraulic pump. Maybe an arcade joystick. Either way, it works now.",
                rewardXP: 20
            },
            {
                text: "Need any help with maintenance?",
                response: "Check the robotics bench or the kickable rocks. If you bump into something, just pretend it was scheduled maintenance.",
                rewardXP: 25,
                friendship: 15
            }
        ]
    },
    dr_elias: {
        greeting: "Why did the operating system go to medical school? ...To cure its memory leaks! Haha!",
        topics: [
            {
                text: "That was a terrible joke, Doctor.",
                response: "Laughter increases endorphins and colony happiness by 4.2%! Standard medical protocol.",
                rewardXP: 20,
                friendship: 15
            },
            {
                text: "How is the bio-diagnostics scanner?",
                response: "Operating at 98%. If you ever need to test your neural RAM memory, step into the bio-bay for the Memory Matrix puzzle.",
                rewardXP: 25
            }
        ]
    },
    nova: {
        greeting: "Look at Pixel! Look at those cute little sensor nodes! Have you told Pixel they are a good robot today?",
        topics: [
            {
                text: "How can I upgrade Pixel?",
                response: "Complete colony activities and solve deadlocks! Pixel unlocks new LED emotes and victory dance routines!",
                rewardXP: 20,
                friendship: 20
            },
            {
                text: "Can I drive the rover in the garage?",
                response: "Yes! Head to the garage terminal and launch the Mars Rover Rally simulation anytime.",
                rewardXP: 25
            }
        ]
    },
    zara: {
        greeting: "I found another strange crystalline rock near the crater rim. It vibrates at 440 Hz. Martian resonance is fascinating.",
        topics: [
            {
                text: "Is there anything dangerous out in the dust?",
                response: "Just dust storms and solar radiation. Keep your suit seals tight and don't forget to kick the rocks for good luck!",
                rewardXP: 25,
                friendship: 15
            }
        ]
    },
    finn: {
        greeting: "Today's special: Martian Hydroponic Protein Stew! It tastes like broccoli, but with 200% more iron!",
        topics: [
            {
                text: "Can I get a snack from the dispenser?",
                response: "Go ahead! Snack dispensers in the recreation dome boost colony happiness and give you an energy boost.",
                rewardXP: 20,
                friendship: 15
            }
        ]
    },
    max: {
        greeting: "Hey! I almost plugged the water pipe into the power inverter earlier, but I caught myself! I'm learning!",
        topics: [
            {
                text: "Keep at it, Max! We all started as Junior Techs.",
                response: "Thanks! One day I'll be managing the 4-Core CPU scheduler just like you!",
                rewardXP: 30,
                friendship: 25
            }
        ]
    }
};

window.NPC_DIALOGUES = NPC_DIALOGUES;
