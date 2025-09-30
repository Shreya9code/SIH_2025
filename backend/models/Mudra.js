const mongoose = require('mongoose');

const mudraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  sanskritName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['asamyuta', 'samyuta', 'nritta', 'abhinaya'],
    required: true
  },
  meaning: {
    type: String,
    required: true
  },
  innerThought: String,
  usage: [String],
  bhavaTags: [String],
  animalsRepresented: [String],
  videoReferences: [{
    title: String,
    url: String,
    duration: String
  }],
  regionalVariations: [{
    region: String,
    variation: String
  }],
  historicalContext: String,
  imageUrl: String,
  commonMistakes: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
});

module.exports = mongoose.model('Mudra', mudraSchema);