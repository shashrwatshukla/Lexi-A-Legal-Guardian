export function generateDeepAnalysisSummary(analysis) {
  // Extract all actual data from the parsed document
  const docType = analysis.documentType || "legal agreement";
  const parties = analysis.parties || [];
  const effectiveDate = analysis.effectiveDate || "not specified";
  const expirationDate = analysis.expirationDate || "not specified";
  const flaggedClauses = analysis.flaggedClauses || [];
  const positiveProvisions = analysis.positiveProvisions || [];
  const obligations = analysis.obligations || [];
  const keyDates = analysis.keyDates || [];
  const missingClauses = analysis.missingClauses || [];
  const actionItems = analysis.actionItems || [];
  const negotiationPoints = analysis.negotiationPoints || [];
  const riskScore = analysis.overallRiskScore || 0;
  const riskLevel = analysis.riskLevel || "Medium";
  const summary = analysis.summary || "";
  const finalVerdict = analysis.finalVerdict || "";

  // Start building the comprehensive summary
  let narrative = "";

  // INTRODUCTION (30-40 words)
  narrative += `I've completed a thorough analysis of this ${docType}. `;
  
  if (parties.length > 0) {
    if (parties.length === 2) {
      narrative += `This agreement is between ${parties[0]} and ${parties[1]}. `;
    } else if (parties.length > 2) {
      const lastParty = parties[parties.length - 1];
      const otherParties = parties.slice(0, -1).join(', ');
      narrative += `This is a multi-party agreement involving ${otherParties}, and ${lastParty}. `;
    } else {
      narrative += `The agreement involves ${parties[0]}. `;
    }
  }

  // DOCUMENT OVERVIEW (40-50 words)
  if (summary) {
    narrative += `${summary} `;
  }

  if (effectiveDate !== "not specified") {
    narrative += `The contract becomes effective on ${effectiveDate}. `;
  }

  if (expirationDate !== "not specified") {
    narrative += `It will expire on ${expirationDate}. `;
  } else {
    narrative += `The duration of this agreement is not clearly specified, which could be a concern. `;
  }

  // RISK ASSESSMENT (50-60 words)
  narrative += `Based on my comprehensive review, this contract carries a ${riskLevel.toLowerCase()} risk level with an overall risk score of ${riskScore} out of 100. `;

  if (riskLevel === "High") {
    narrative += `This elevated risk rating means there are substantial concerns that could expose you to legal or financial liability. I strongly recommend obtaining professional legal counsel before proceeding. `;
  } else if (riskLevel === "Medium") {
    narrative += `While not critically dangerous, this moderate risk level indicates several clauses that warrant careful attention and possible negotiation before you sign. `;
  } else {
    narrative += `This low risk assessment suggests the contract terms are relatively balanced, though you should still review all details carefully. `;
  }

  // CRITICAL ISSUES DETAIL (80-100 words)
  const criticalClauses = flaggedClauses.filter(c => c.severity === 'critical');
  const warningClauses = flaggedClauses.filter(c => c.severity === 'warning');
  
  if (criticalClauses.length > 0) {
    narrative += `I've identified ${criticalClauses.length} critical ${criticalClauses.length === 1 ? 'issue' : 'issues'} that demand immediate attention. `;
    
    // Detail each critical clause
    criticalClauses.slice(0, 3).forEach((clause, index) => {
      narrative += `${clause.title || `Critical issue number ${index + 1}`}: ${clause.explanation || clause.risk || 'This clause presents significant concerns'}. `;
      if (clause.suggestion) {
        narrative += `${clause.suggestion}. `;
      }
    });

    if (criticalClauses.length > 3) {
      narrative += `There are ${criticalClauses.length - 3} additional critical items detailed in the full analysis. `;
    }
  }

  // WARNING LEVEL CLAUSES (60-80 words)
  if (warningClauses.length > 0) {
    narrative += `Beyond the critical issues, there are ${warningClauses.length} warning-level ${warningClauses.length === 1 ? 'clause' : 'clauses'} that need your consideration. `;
    
    // Detail some warning clauses
    warningClauses.slice(0, 2).forEach((clause) => {
      narrative += `Regarding ${clause.title || 'one of these clauses'}: ${clause.explanation || clause.risk || 'This requires your attention'}. `;
    });
  }

  // POSITIVE ASPECTS (40-50 words)
  if (positiveProvisions.length > 0) {
    narrative += `On the positive side, I found ${positiveProvisions.length} ${positiveProvisions.length === 1 ? 'provision' : 'provisions'} that actually work in your favor. `;
    
    positiveProvisions.slice(0, 2).forEach((provision) => {
      narrative += `The contract includes ${provision.title || 'a beneficial clause'} which ${provision.benefit || 'protects your interests'}. `;
    });
  } else {
    narrative += `Unfortunately, I didn't identify any clauses that specifically provide strong protections for your interests, which is something you should address in negotiations. `;
  }

  // OBLIGATIONS AND RESPONSIBILITIES (50-60 words)
  if (obligations.length > 0) {
    narrative += `This agreement establishes ${obligations.length} specific ${obligations.length === 1 ? 'obligation' : 'obligations'} that you must fulfill. `;
    
    obligations.slice(0, 3).forEach((obligation) => {
      const obligationText = typeof obligation === 'string' ? obligation : obligation.description || obligation.text;
      const deadline = obligation.deadline || obligation.dueDate;
      
      if (deadline) {
        narrative += `You are required to ${obligationText} by ${deadline}. `;
      } else {
        narrative += `You must ${obligationText}. `;
      }
    });

    if (obligations.length > 3) {
      narrative += `There are ${obligations.length - 3} additional obligations outlined in the contract. `;
    }
  }

  // KEY DATES AND DEADLINES (30-40 words)
  if (keyDates.length > 0) {
    narrative += `Important dates to note include: `;
    
    keyDates.slice(0, 3).forEach((dateItem) => {
      const dateText = typeof dateItem === 'string' ? dateItem : dateItem.description || dateItem.event;
      const date = dateItem.date;
      
      if (date) {
        narrative += `${dateText} on ${date}, `;
      } else {
        narrative += `${dateText}, `;
      }
    });
    
    narrative += `Make sure to track these deadlines carefully. `;
  }

  // MISSING CLAUSES (40-50 words)
  if (missingClauses.length > 0) {
    narrative += `A significant concern is that this contract is missing ${missingClauses.length} standard protective ${missingClauses.length === 1 ? 'clause' : 'clauses'} typically found in agreements of this type. `;
    
    missingClauses.slice(0, 2).forEach((missing) => {
      narrative += `Notably absent is ${missing.clause || 'a standard protection'}, which ${missing.importance || 'is important for your security'}. `;
    });

    if (missingClauses.length > 2) {
      narrative += `I've identified ${missingClauses.length - 2} other missing clauses you should consider requesting. `;
    }
  }

  // ACTION ITEMS (50-60 words)
  if (actionItems.length > 0) {
    narrative += `I've prepared ${actionItems.length} specific action ${actionItems.length === 1 ? 'item' : 'items'} for you. `;
    
    actionItems.slice(0, 3).forEach((action, index) => {
      const actionText = typeof action === 'string' ? action : action.action || action.description;
      const priority = action.priority || 'medium';
      
      if (priority === 'high' || priority === 'critical') {
        narrative += `Urgent action needed: ${actionText}. `;
      } else {
        narrative += `${actionText}. `;
      }
    });
  }

  // NEGOTIATION POINTS (40-50 words)
  if (negotiationPoints.length > 0) {
    narrative += `When negotiating this contract, focus on these ${negotiationPoints.length} key ${negotiationPoints.length === 1 ? 'point' : 'points'}. `;
    
    negotiationPoints.slice(0, 2).forEach((point) => {
      const pointText = typeof point === 'string' ? point : point.point || point.description;
      narrative += `Consider negotiating ${pointText}. `;
    });
  }

  // FINAL VERDICT AND RECOMMENDATION (40-50 words)
  if (finalVerdict) {
    narrative += `${finalVerdict} `;
  }

  if (riskLevel === "High") {
    narrative += `Given the high risk level, I strongly advise against signing this contract without substantial modifications and professional legal review. The potential consequences of the problematic clauses could be severe. `;
  } else if (riskLevel === "Medium") {
    narrative += `While this contract isn't critically flawed, I recommend having a legal professional review it, particularly focusing on the flagged clauses. Don't rush into signing without addressing these concerns. `;
  } else {
    narrative += `This contract appears relatively balanced, but please take time to read through all the details and ask questions about anything that's unclear. Even low-risk contracts deserve careful attention. `;
  }

    // CLOSING (ultra-short)
  narrative += `Review details below.`;

  // Ensure total length is reasonable (max ~300 words for SSML compatibility)
  const words = narrative.split(/\s+/);
  if (words.length > 300) {
    narrative = words.slice(0, 300).join(' ') + '... See full analysis below.';
  }

  return narrative;
}