const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Member Name is required"],
    trim: true
  },
  // The specific list you requested
  teamName: { 
    type: String, 
    required: true,
    enum: [
      'Technical', 'PR', 'Drama', 'Cultural', 
      'Sponsorship', 'Decor', 'Catering', 
      'Workshop', 'Discipline', 'Coverage', 'Finance', 'Digital'
    ]
  },
  // The specific types you requested
  memberType: { 
    type: String, 
    required: true,
    enum: ['Core', 'Sub-Core']
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  linkedin: { 
    type: String, 
    default: '#' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);