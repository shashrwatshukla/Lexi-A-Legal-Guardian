





export const riskKeywords = [

  "indemnify", "indemnification", "hold harmless", "liability", "waiver", 

  "warranty", "disclaimer", "confidential", "arbitration", "litigation", 

  "penalty", "default", "termination", "non-refundable", "non-compete", 

  "exclusive", "irrevocable", "sole discretion", "at your own risk", 

  "as is", "without limitation", "consequential damages", "limitation of liability",

  "liquidated damages", "jurisdiction", "venue", "governing law", "severability",

  "force majeure", "assignment", "amendment", "notice", "entire agreement"

];



export const clausePatterns = [

  {

    pattern: /(indemnify|indemnification|hold harmless).{10,200}(liability|damages|losses)/i,

    reason: "This indemnification clause may transfer significant liability to you."

  },

  {

    pattern: /(limitation of liability|limit liability|liability limit).{10,150}(direct damages|consequential damages)/i,

    reason: "This clause may severely limit your ability to recover damages."

  },

  {

    pattern: /(arbitration|dispute resolution).{10,150}(waive.*jury trial|class action)/i,

    reason: "This arbitration clause may prevent you from pursuing class actions or jury trials."

  },

  {

    pattern: /(termination|cancel).{10,150}(without cause|sole discretion|immediately)/i,

    reason: "This termination clause may allow the other party to end the agreement easily."

  },

  {

    pattern: /(confidentiality|non-disclosure).{10,150}(perpetual|indefinite|survive)/i,

    reason: "This confidentiality clause may impose indefinite restrictions on information sharing."

  },

  {

    pattern: /(non-compete|non-solicit).{10,200}(employment|business)/i,

    reason: "This non-compete clause may restrict your future employment or business opportunities."

  },

  {

    pattern: /(payment|fee).{10,150}(non-refundable|advance|upfront)/i,

    reason: "This payment clause may require non-refundable fees regardless of service quality."

  },

  {

    pattern: /(governing law|jurisdiction|venue).{10,150}(state|country)/i,

    reason: "This clause determines which state's laws apply and where disputes must be resolved."

  },

  {

    pattern: /(assignment).{10,100}(without consent|prior written consent)/i,

    reason: "This assignment clause may restrict your ability to transfer rights under the agreement."

  },

  {

    pattern: /(amendment|modification).{10,100}(writing|written consent)/i,

    reason: "This amendment clause specifies how the agreement can be changed."

  }

];