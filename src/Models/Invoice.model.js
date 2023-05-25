const mongoose = require("mongoose");
const joi = require("joi");
joi.objectId = require("joi-objectid")(joi);

const invoiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  budget: { type: Number, required: true },
  // category: { type: String, required: true },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  location: { type: String, required: true },
  details: { type: String, required: false },
  status: { type: String },
  duration: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const validate = (invoice) => {
  const schema = joi.object({
    name: joi.string().min(3).max(100).required(),
    budget: joi.number().required(),
    client_id: joi.objectId().required(),
    location: joi.string().required(),
    details: joi.string().required(),
    status: joi.string(),
    duration: joi.number().required(),
    created_at: joi.date(),
    updated_at: joi.date()
  });

  return schema.validate(invoice);
};

const Invoice = mongoose.model("invoice", invoiceSchema);

module.exports = { Invoice, validate };
