export interface TarotCard {
  id: number;
  name: string;
  sanskrit: string;
  message: string;
  prompt: string;
}

// A Vedic-flavoured 22-card major arcana with original interpretive copy.
export const TAROT_DECK: TarotCard[] = [
  { id: 0, name: 'The Wanderer', sanskrit: 'Sannyasi', message: 'A fresh cycle opens before you. Step forward with trust rather than certainty — the path reveals itself only to those who begin walking it.', prompt: 'Where in my life am I being invited to begin again?' },
  { id: 1, name: 'The Adept', sanskrit: 'Siddha', message: 'You hold every tool you need. Will, focus, and skill are aligned today — act on what you have been preparing.', prompt: 'What am I ready to manifest with the resources already in my hands?' },
  { id: 2, name: 'The Oracle', sanskrit: 'Rishika', message: 'Inner knowing speaks softly today. Quiet the noise and listen — the answer you seek is already within.', prompt: 'What does my intuition know that my mind keeps overruling?' },
  { id: 3, name: 'The Mother', sanskrit: 'Devi', message: 'Abundance and nurturing energy surround you. Tend what you wish to grow, and receive what is offered with open hands.', prompt: 'What in my life is asking to be nourished?' },
  { id: 4, name: 'The Sovereign', sanskrit: 'Raja', message: 'Structure brings freedom. Lead your own life with steady authority and clear boundaries today.', prompt: 'Where do I need to take responsible command?' },
  { id: 5, name: 'The Guru', sanskrit: 'Acharya', message: 'Wisdom flows through tradition and teachers. Seek guidance, or share the wisdom you have earned.', prompt: 'What teaching — given or received — is meant for me today?' },
  { id: 6, name: 'The Union', sanskrit: 'Samyoga', message: 'A meaningful choice about connection arises. Align your relationships with your deepest values.', prompt: 'What does my heart truly want to say yes to?' },
  { id: 7, name: 'The Chariot', sanskrit: 'Ratha', message: 'Momentum is yours when opposing forces are harnessed. Direct your energy with focus and you will advance.', prompt: 'Which inner tensions can I unite toward one direction?' },
  { id: 8, name: 'Inner Strength', sanskrit: 'Shakti', message: 'True power is gentle. Meet challenge with patience and compassion rather than force.', prompt: 'Where can softness accomplish what force cannot?' },
  { id: 9, name: 'The Hermit', sanskrit: 'Tapasvi', message: 'Solitude illuminates. Withdraw briefly to find the light you will later carry to others.', prompt: 'What truth might solitude reveal to me right now?' },
  { id: 10, name: 'The Wheel', sanskrit: 'Kala Chakra', message: 'Cycles turn. What rises will rest, and what rests will rise — flow with the rhythm rather than against it.', prompt: 'What turning of fortune am I being asked to accept?' },
  { id: 11, name: 'The Balance', sanskrit: 'Dharma', message: 'Truth and fairness call. Act in alignment with what is just, and trust cause and effect.', prompt: 'Where am I being called to act with integrity?' },
  { id: 12, name: 'The Surrender', sanskrit: 'Samarpana', message: 'A new perspective comes through letting go. Release control and see the situation upside-down.', prompt: 'What am I clinging to that I am meant to release?' },
  { id: 13, name: 'The Transformation', sanskrit: 'Parivartana', message: 'An ending makes space for renewal. Allow what is finished to fall away without fear.', prompt: 'What is ready to end so that something new can begin?' },
  { id: 14, name: 'The Alchemist', sanskrit: 'Rasayana', message: 'Patience blends opposites into gold. Moderate, harmonise, and let the slow work do its work.', prompt: 'Where is patience the true path to mastery?' },
  { id: 15, name: 'The Shadow', sanskrit: 'Maya', message: 'Notice where attachment or illusion binds you. Awareness itself loosens the chain.', prompt: 'What attachment is quietly running my choices?' },
  { id: 16, name: 'The Awakening', sanskrit: 'Vidyut', message: 'A sudden shift clears false foundations. What feels like upheaval is liberation in disguise.', prompt: 'What false structure is ready to fall in my life?' },
  { id: 17, name: 'The Star', sanskrit: 'Tara', message: 'Hope returns and renewal flows. After difficulty, you are being gently restored.', prompt: 'What quiet hope is asking me to trust it again?' },
  { id: 18, name: 'The Moon', sanskrit: 'Chandra', message: 'The path is dim and dreamlike. Trust feeling over logic, but watch for self-deception.', prompt: 'What is my fear distorting that deserves a clearer look?' },
  { id: 19, name: 'The Sun', sanskrit: 'Surya', message: 'Clarity, joy, and vitality shine. Step into the warmth and let your truth be seen.', prompt: 'Where can I let myself shine without apology today?' },
  { id: 20, name: 'The Reckoning', sanskrit: 'Punarjanma', message: 'A moment of honest review and rebirth. Answer the call to rise into a truer version of yourself.', prompt: 'What am I being called to awaken to and rise toward?' },
  { id: 21, name: 'The Cosmos', sanskrit: 'Brahmanda', message: 'Completion and wholeness arrive. A cycle fulfils itself — celebrate, integrate, and prepare to begin anew.', prompt: 'What journey am I ready to honour as complete?' },
];
