const mongoose = require('mongoose');

// PRO TIP: Enums use karne se database mein 'spelling mistakes' nahi hoti.
const VALID_VERSES = ['spy-verse', 'scifi-verse', 'carnival-verse', 'dark-verse', 'mythic-verse'];
const VALID_TYPES = ['tech-event', 'non-tech-event', 'tech-workshop', 'non-tech-workshop', 'fun-event'];

const eventSchema = new mongoose.Schema(
  {
    title: { 
        type: String, 
        required: [true, 'Event title is required'], 
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'] 
    },
    posterLink: { 
        type: String, 
        required: [true, 'Poster image is required'] 
    }, 
    logoLink: { 
        type: String, 
        required: [true, 'Event logo is required'] 
    }, 
    
    registrationLink: {
      type: String,
      default: 'https://docs.google.com/forms/d/e/1FAIpQLScgtiypem-sFFfbdoAOOUBprF1drgcocTMlpe9ESd_c8EuErA/viewform?usp=sharing&ouid=109706187660263354341', 
      trim: true
    },

    // --- CATEGORIZATION (NO REDUNDANCY LOGIC) ---
    
    // 1. THE VERSE (Category)
    category: {
      type: String,
      required: [true, 'Verse category is required'],
      enum: {
        values: VALID_VERSES,
        message: '{VALUE} is not a valid verse.'
      }
    },

    // 2. THE TYPE (Event Nature)
    eventType: {
      type: String,
      required: [true, 'Event Type is required'],
      enum: {
        values: VALID_TYPES,
        message: '{VALUE} is not a valid event type.'
      }
    },

    // --- LOGISTICS ---
    day: { 
        type: String, 
        enum: ['Pre-Fest', 'Day 1', 'Day 2', 'Day 3'], 
        required: [true, 'Day is required'] 
    },
    date: { type: String }, // Flexible string for date
    time: { type: String, required: true },
    duration: { type: String, required: true },
    teamSize: { type: String, required: true },
    prizePool: { type: String },
    registrationFee: { type: String }
  },
  { timestamps: true } // Auto-manage createdAt and updatedAt
);

module.exports = mongoose.model('Event', eventSchema);