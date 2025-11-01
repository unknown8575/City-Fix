import { Complaint, ComplaintStatus, AnalyticsStats, DashboardStats } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { fileToBase64 } from '../utils/fileUtils';

const complaints: Complaint[] = [
  {
    id: 'TKT-12345',
    category: 'Waste Management',
    description: 'Garbage has not been collected in our area for the past 3 days. It is causing a foul smell and attracting pests.',
    location: 'Near City Park, Ward 5, Lucknow',
    contact: '9876543210',
    status: ComplaintStatus.IN_PROGRESS,
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago, SLA breach
    photoBeforeUrl: 'https://picsum.photos/seed/before1/400/300',
    aiConfidence: 92,
    escalationDept: 'Sanitation Dept.',
    aiPriority: 'Medium',
    aiJustification: "Priority set to Medium based on keywords '3 days' and category 'Waste Management'.",
    aiSummary: "Uncollected garbage for 3 days is causing a foul smell and attracting pests in Ward 5.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Dispatch a sanitation crew immediately and confirm collection within 24 hours.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen and pending review.' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), notes: 'Assigned to Sanitation Dept. supervisor.' },
    ]
  },
  {
    id: 'TKT-54321',
    category: 'Road Maintenance',
    description: 'Large pothole on the main road is causing traffic issues and is dangerous for two-wheelers.',
    location: 'MG Road, near Metro Station',
    contact: '9123456789',
    status: ComplaintStatus.RESOLVED,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    photoBeforeUrl: 'https://picsum.photos/seed/before2/400/300',
    photoAfterUrl: 'https://picsum.photos/seed/after2/400/300',
    aiConfidence: 98,
    escalationDept: 'Public Works Dept.',
    aiPriority: 'High',
    aiJustification: "Priority set to High due to keyword 'dangerous' and category 'Road Maintenance'.",
    aiSummary: "A large, dangerous pothole on MG Road is creating a traffic hazard, especially for two-wheelers.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Assign to PWD for urgent repair. Place temporary barricades until fixed.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen and pending review.' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), notes: 'Work order created and assigned to contractor.' },
      { status: ComplaintStatus.RESOLVED, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: 'Pothole repaired. Photos uploaded by field agent.' },
    ]
  },
  {
    id: 'TKT-98760',
    category: 'Street Lighting',
    description: 'Street light on our lane is not working for a week. It is very dark and unsafe at night.',
    location: 'Lane 3, Sector B, Indiranagar',
    contact: '9988776655',
    status: ComplaintStatus.PENDING,
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    aiConfidence: 85,
    isDuplicateOf: 'TKT-98755',
    escalationDept: 'Electrical Dept.',
    aiPriority: 'Medium',
    aiJustification: "Priority set to Medium based on category 'Street Lighting' and potential safety risk.",
    aiSummary: "A street light in Lane 3, Indiranagar has been non-functional for a week, causing safety concerns due to darkness.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Check for duplicates, then assign to the Electrical Dept. for repair.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen. AI flagged as potential duplicate.' },
    ]
  },
   {
    id: 'TKT-24680',
    category: 'Waste Management',
    description: 'Public dustbin is overflowing near the community hall.',
    location: 'Community Hall, Sector D',
    contact: '9112233445',
    status: ComplaintStatus.PENDING,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    aiConfidence: 95,
    escalationDept: 'Sanitation Dept.',
    aiPriority: 'Low',
    aiJustification: "Standard priority for 'Waste Management' issues. No urgent keywords detected.",
    aiSummary: "The public dustbin near the community hall in Sector D is overflowing.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Schedule for the next available collection round.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen and is pending review.' },
    ]
  },
  {
    id: 'TKT-13579',
    category: 'Water Supply',
    description: 'Water leakage from the main pipeline on the street corner. A lot of water is being wasted.',
    location: 'Corner of 1st Main and 3rd Cross, Jayanagar',
    contact: '9555666777',
    status: ComplaintStatus.IN_PROGRESS,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    photoBeforeUrl: 'https://picsum.photos/seed/before3/400/300',
    aiConfidence: 96,
    escalationDept: 'Water Board',
    aiPriority: 'High',
    aiJustification: "Priority set to High due to 'leakage' and 'wasted' keywords. Potential for significant resource loss.",
    aiSummary: "Significant water wastage is occurring from a main pipeline leak at a street corner in Jayanagar.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Dispatch an emergency repair team from the Water Board to prevent further water loss.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted and pending review.' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), notes: 'Repair team dispatched to location.' },
    ]
  }
];

/**
 * AI Service Contract (Simulated Backend Endpoint)
 * Analyzes complaint details to provide triage information.
 * @param {string} category - The complaint category.
 * @param {string} description - The citizen's description of the issue.
 * @returns {Promise<Object>} An object containing AI-driven insights.
 *   - escalationDept: Suggested department.
 *   - aiPriority: Suggested priority ('High', 'Medium', 'Low').
 *   - aiJustification: Reason for the suggestions.
 *   - aiSummary: A concise summary of the complaint.
 *   - aiRelevanceFlag: 'Actionable' or 'Normal Complaint'.
 *   - aiActionRecommendation: A suggested next step for the admin.
 *   - aiConfidence: A simulated confidence score.
 */
export const getAiComplaintAnalysis = async (
  category: string,
  description: string
): Promise<{
  escalationDept: string;
  aiPriority: 'High' | 'Medium' | 'Low';
  aiJustification: string;
  aiSummary: string;
  aiRelevanceFlag: 'Actionable' | 'Normal Complaint';
  aiActionRecommendation: string;
  aiConfidence: number;
}> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not set. Returning mock AI analysis.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          escalationDept: 'Public Works Dept.',
          aiPriority: 'Medium',
          aiJustification: 'Mock AI: Priority set based on keywords in description.',
          aiSummary: 'Mock AI: A summary of the complaint description would appear here.',
          aiRelevanceFlag: 'Actionable',
          aiActionRecommendation: 'Mock AI: A recommended action would be suggested here.',
          aiConfidence: 88,
        });
      }, 1000);
    });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      escalationDept: {
        type: Type.STRING,
        description: 'The suggested municipal department to handle this complaint.',
        enum: ['Sanitation Dept.', 'Public Works Dept.', 'Electrical Dept.', 'Water Board', 'Parks & Recreation', 'Traffic Police', 'Other']
      },
      aiPriority: {
        type: Type.STRING,
        description: 'The suggested priority level for this complaint.',
        enum: ['High', 'Medium', 'Low']
      },
      aiJustification: {
        type: Type.STRING,
        description: 'A brief justification for the suggested department and priority.',
      },
      aiSummary: {
        type: Type.STRING,
        description: 'A concise one-sentence summary of the core problem described in the complaint.',
      },
      aiRelevanceFlag: {
          type: Type.STRING,
          description: "A flag indicating if the text is an actionable complaint.",
          enum: ['Actionable', 'Normal Complaint']
      },
      aiActionRecommendation: {
          type: Type.STRING,
          description: "A concrete next step or action to be taken by the administrator."
      }
    },
    required: ['escalationDept', 'aiPriority', 'aiJustification', 'aiSummary', 'aiRelevanceFlag', 'aiActionRecommendation'],
  };

  const textPart = {
    text: `You are an expert municipal operations manager for an Indian city. Analyze the following civic complaint.
    1.  Generate a concise, one-sentence summary of the core problem.
    2.  Determine if the complaint text is actionable. If it describes a clear civic issue, flag it as 'Actionable', otherwise flag as 'Normal Complaint'.
    3.  Suggest the correct municipal department for escalation ('Sanitation Dept.', 'Public Works Dept.', etc.).
    4.  Assign a priority level ('High', 'Medium', 'Low').
    5.  Provide a brief justification for your choices.
    6.  Recommend a clear, concrete next step for the admin to take.
    
    Complaint Category: "${category}"
    Complaint Description: "${description}"`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && result.escalationDept && result.aiPriority && result.aiJustification) {
      return {
        escalationDept: result.escalationDept,
        aiPriority: result.aiPriority,
        aiJustification: result.aiJustification,
        aiSummary: result.aiSummary,
        aiRelevanceFlag: result.aiRelevanceFlag,
        aiActionRecommendation: result.aiActionRecommendation,
        aiConfidence: Math.floor(80 + Math.random() * 20), // Gemini doesn't provide a confidence score, so we'll simulate one.
      };
    }

    throw new Error('Invalid response structure from AI for complaint analysis.');

  } catch (error) {
    console.error('Error getting AI complaint analysis:', error);
    throw new Error('Failed to get AI analysis. Please try again.');
  }
};


export const submitComplaint = async (data: FormData): Promise<{ ticketId: string }> => {
  console.log('Submitting complaint:', Object.fromEntries(data.entries()));

  const ticketId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
  const category = data.get('category') as string;
  const description = data.get('description') as string;

  // Get AI analysis for department, priority, etc.
  const aiAnalysis = await getAiComplaintAnalysis(category, description);

  // In a real app, you would handle file uploads to a storage service
  // and get a URL. Here we'll use a local blob URL for demonstration.
  const photoFile = data.get('photo') as File | null;
  const photoBeforeUrl = photoFile ? URL.createObjectURL(photoFile) : undefined;
  
  const newComplaint: Complaint = {
    id: ticketId,
    category: category,
    description: description,
    location: data.get('location') as string,
    contact: data.get('contact') as string,
    status: ComplaintStatus.PENDING,
    submittedAt: new Date(),
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(), notes: 'Complaint submitted by citizen and is pending review.' },
    ],
    photoBeforeUrl: photoBeforeUrl,
    // Add AI analysis results
    escalationDept: aiAnalysis.escalationDept,
    aiPriority: aiAnalysis.aiPriority,
    aiJustification: aiAnalysis.aiJustification,
    aiSummary: aiAnalysis.aiSummary,
    aiRelevanceFlag: aiAnalysis.aiRelevanceFlag,
    aiActionRecommendation: aiAnalysis.aiActionRecommendation,
    aiConfidence: aiAnalysis.aiConfidence,
  };

  // Add the new complaint to the start of the list so it appears first on the dashboard
  complaints.unshift(newComplaint);

  return new Promise(resolve => {
    // Simulate a short network delay after AI processing
    setTimeout(() => {
      resolve({ ticketId });
    }, 500);
  });
};


export const fetchComplaintById = async (id: string): Promise<Complaint | null> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const found = complaints.find(c => c.id.toLowerCase() === id.toLowerCase());
      resolve(found || null);
    }, 1000);
  });
};

export const fetchAllComplaints = async (): Promise<Complaint[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...complaints].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()));
        }, 1200);
    });
};

export const fetchDashboardStats = (allComplaints: Complaint[]): DashboardStats => {
    const open = allComplaints.filter(c => c.status === ComplaintStatus.PENDING || c.status === ComplaintStatus.IN_PROGRESS).length;

    const resolved = allComplaints.filter(c => c.status === ComplaintStatus.RESOLVED && c.resolvedAt);
    const totalResolutionTime = resolved.reduce((acc, c) => {
        const resolutionTime = c.resolvedAt!.getTime() - c.submittedAt.getTime();
        return acc + resolutionTime;
    }, 0);
    const avgResolutionMillis = resolved.length > 0 ? totalResolutionTime / resolved.length : 0;
    const avgResolutionHours = (avgResolutionMillis / (1000 * 60 * 60)).toFixed(1);

    // Mock SLA: Any 'In Progress' complaint older than 3 days
    const slaBreaches = allComplaints.filter(c => {
        if (c.status === ComplaintStatus.IN_PROGRESS) {
            const ageInMillis = new Date().getTime() - c.submittedAt.getTime();
            const ageInDays = ageInMillis / (1000 * 60 * 60 * 24);
            return ageInDays > 3;
        }
        return false;
    }).length;

    return {
        open,
        avgResolutionHours: avgResolutionHours,
        slaBreaches,
    };
};

export const fetchAnalyticsStats = async (): Promise<AnalyticsStats> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                processedLast30Days: '3,247',
                avgResolutionHours: '18.5',
                citizenSatisfaction: '89%',
                duplicateReduction: '40%',
            });
        }, 800);
    });
};

export const sendCitizenNotification = async ({
  ticketId,
  contact,
  newStatus,
  notes,
}: {
  ticketId: string;
  contact: string;
  newStatus: ComplaintStatus;
  notes: string;
}): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const message = `Dear Citizen, the status of your complaint #${ticketId} has been updated to "${newStatus}". Note: ${notes}`;
      console.log(`[NOTIFICATION SIMULATION]`);
      console.log(`---------------------------`);
      console.log(`Type: SMS/Email`);
      console.log(`To: ${contact}`);
      console.log(`Message: ${message}`);
      console.log(`---------------------------`);
      resolve();
    }, 1000); // Simulate network delay
  });
};

export const analyzeImage = async (imageFile: File): Promise<{ category: string; description: string }> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set. Returning mock data.");
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          category: 'road_maintenance',
          description: 'AI analysis suggests a large pothole on a main road, causing a potential hazard for vehicles. Please add more details if possible. (Mock Response)',
        });
      }, 1500);
    });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const base64Image = await fileToBase64(imageFile);

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: imageFile.type,
    },
  };

  const textPart = {
    text: `Analyze the attached image of a civic issue in an Indian city. Based on the image, identify the most appropriate category for the complaint and write a brief, objective description of the problem. The category must be one of the following: waste_management, road_maintenance, water_supply, street_lighting, public_safety, other. The description should be suitable for a formal complaint to municipal authorities.`
  };
  
  const schema = {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The category of the civic complaint. Must be one of: waste_management, road_maintenance, water_supply, street_lighting, public_safety, other.',
        enum: ['waste_management', 'road_maintenance', 'water_supply', 'street_lighting', 'public_safety', 'other']
      },
      description: {
        type: Type.STRING,
        description: 'A detailed description of the issue visible in the image, suitable for a formal complaint.',
      },
    },
    required: ['category', 'description'],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && typeof result.category === 'string' && typeof result.description === 'string') {
        const allowedCategories = ['waste_management', 'road_maintenance', 'water_supply', 'street_lighting', 'public_safety', 'other'];
        if (allowedCategories.includes(result.category)) {
            return { category: result.category, description: result.description };
        }
    }
    
    throw new Error('Invalid response structure from AI.');

  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error('Failed to analyze image. Please try again or enter details manually.');
  }
};