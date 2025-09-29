export const BERT_MODELS = {
  "bert-base-uncased": {
    name: "HuggingFaceH4/zephyr-7b-beta", // Using working model instead of BERT
    displayName: "BERT Base Uncased",
    description: "BERT base model (uncased) - using Zephyr 7B fallback for text generation",
    industry: "General",
    temperature: 0.7,
    apiConfig: {
      max_new_tokens: 150,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      repetition_penalty: 1.1,
    },
  },
  "bert-large-uncased": {
    name: "microsoft/DialoGPT-medium",
    displayName: "BERT Large Uncased",
    description: "BERT large model (uncased) - using DialoGPT medium for conversational responses",
    industry: "General",
    temperature: 0.7,
    apiConfig: {
      max_new_tokens: 150,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      repetition_penalty: 1.1,
    },
  },
  "bert-base-cased": {
    name: "google/flan-t5-base",
    displayName: "BERT Base Cased",
    description: "BERT base model (cased) - using FLAN-T5 base for instruction following",
    industry: "General",
    temperature: 0.7,
    apiConfig: {
      max_new_tokens: 150,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      repetition_penalty: 1.1,
    },
  },
  "bert-large-cased": {
    name: "HuggingFaceH4/zephyr-7b-beta",
    displayName: "BERT Large Cased",
    description: "BERT large model (cased) - using Zephyr 7B for advanced reasoning",
    industry: "General",
    temperature: 0.7,
    apiConfig: {
      max_new_tokens: 150,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      repetition_penalty: 1.1,
    },
  },
  "distilbert-base-uncased": {
    name: "distilgpt2",
    displayName: "DistilBERT Base Uncased",
    description: "Distilled BERT model - using DistilGPT2 for fast text generation",
    industry: "General",
    temperature: 0.7,
    apiConfig: {
      max_new_tokens: 150,
      top_p: 0.9,
      do_sample: true,
      return_full_text: false,
      repetition_penalty: 1.1,
    },
  },
}

export const MODEL_CAPABILITIES = {
  "bert-base-uncased": ["text-generation", "question-answering", "conversation"],
  "bert-large-uncased": ["text-generation", "question-answering", "conversation"],
  "bert-base-cased": ["text-generation", "question-answering", "instruction-following"],
  "bert-large-cased": ["text-generation", "question-answering", "reasoning"],
  "distilbert-base-uncased": ["text-generation", "question-answering", "fast-inference"],
}

export const FALLBACK_CONFIG = {
  name: "HuggingFaceH4/zephyr-7b-beta",
  displayName: "Fallback Model",
  description: "Fallback model when primary model fails",
  industry: "General",
  temperature: 0.7,
  apiConfig: {
    max_new_tokens: 150,
    top_p: 0.9,
    do_sample: true,
    return_full_text: false,
    repetition_penalty: 1.1,
  },
}
