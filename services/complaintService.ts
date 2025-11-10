import { Complaint, ComplaintStatus, AnalyticsStats, DashboardStats, PredictionData, RiskLevel } from '../types';
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
    assignedOfficial: { name: 'Mr. Rajesh Kumar', photoUrl: 'https://i.pravatar.cc/150?u=rajesh' },
    aiPriority: 'Medium',
    aiJustification: "Priority set to Medium based on keywords '3 days' and category 'Waste Management'.",
    aiSummary: "Uncollected garbage for 3 days is causing a foul smell and attracting pests in Ward 5.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Dispatch a sanitation crew immediately and confirm collection within 24 hours.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen.', actor: 'Citizen' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), notes: 'Assigned to Sanitation Dept. supervisor Mr. Rajesh Kumar.', actor: 'Admin' },
    ]
  },
  {
    id: 'TKT-54321',
    category: 'Road Maintenance',
    description: 'Large pothole on the main road is causing traffic issues and is dangerous for two-wheelers.',
    location: 'MG Road, near Metro Station',
    contact: '9123456789',
    status: ComplaintStatus.CLOSED,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    photoBeforeUrl: 'https://picsum.photos/seed/before2/400/300',
    photoAfterUrl: 'https://picsum.photos/seed/after2/400/300',
    citizenSatisfactionScore: 5,
    aiConfidence: 98,
    escalationDept: 'Public Works Dept.',
    assignedOfficial: { name: 'Ms. Priya Singh', photoUrl: 'https://i.pravatar.cc/150?u=priya' },
    aiPriority: 'High',
    aiJustification: "Priority set to High due to keyword 'dangerous' and category 'Road Maintenance'.",
    aiSummary: "A large, dangerous pothole on MG Road is creating a traffic hazard, especially for two-wheelers.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Assign to PWD for urgent repair. Place temporary barricades until fixed.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen.', actor: 'Citizen' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), notes: 'Work order created and assigned to contractor by Ms. Priya Singh.', actor: 'Admin' },
      { status: ComplaintStatus.RESOLVED, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: 'Pothole repaired. Photos uploaded by field agent.', actor: 'Admin' },
      { status: ComplaintStatus.CLOSED, timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), notes: 'Citizen feedback received: 5/5. Ticket closed automatically.', actor: 'System' },
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
    assignedOfficial: { name: 'Mr. Amit Sharma', photoUrl: 'https://i.pravatar.cc/150?u=amit' },
    aiPriority: 'Medium',
    aiJustification: "Priority set to Medium based on category 'Street Lighting' and potential safety risk.",
    aiSummary: "A street light in Lane 3, Indiranagar has been non-functional for a week, causing safety concerns due to darkness.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Check for duplicates, then assign to the Electrical Dept. for repair.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen. AI flagged as potential duplicate.', actor: 'System' },
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
    assignedOfficial: { name: 'Mr. Rajesh Kumar', photoUrl: 'https://i.pravatar.cc/150?u=rajesh' },
    aiPriority: 'Low',
    aiJustification: "Standard priority for 'Waste Management' issues. No urgent keywords detected.",
    aiSummary: "The public dustbin near the community hall in Sector D is overflowing.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Schedule for the next available collection round.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted by citizen and is pending review.', actor: 'Citizen' },
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
    assignedOfficial: { name: 'Mrs. Sunita Devi', photoUrl: 'https://i.pravatar.cc/150?u=sunita' },
    aiPriority: 'High',
    aiJustification: "Priority set to High due to 'leakage' and 'wasted' keywords. Potential for significant resource loss.",
    aiSummary: "Significant water wastage is occurring from a main pipeline leak at a street corner in Jayanagar.",
    aiRelevanceFlag: 'Actionable',
    aiActionRecommendation: 'Dispatch an emergency repair team from the Water Board to prevent further water loss.',
    history: [
      { status: ComplaintStatus.PENDING, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), notes: 'Complaint submitted and pending review.', actor: 'Citizen' },
      { status: ComplaintStatus.IN_PROGRESS, timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), notes: 'Repair team dispatched to location by Mrs. Sunita Devi.', actor: 'Admin' },
    ]
  }
];

// --- Real-time subscription system ---
type Subscriber = (complaints: Complaint[]) => void;
let subscribers: Subscriber[] = [];

const notify = () => {
    const sortedComplaints = [...complaints].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    subscribers.forEach(callback => callback(sortedComplaints));
};

export const subscribeToComplaints = (callback: Subscriber): (() => void) => {
    subscribers.push(callback);
    // Immediately notify with current state
    const sortedComplaints = [...complaints].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    callback(sortedComplaints);
    return () => {
        subscribers = subscribers.filter(sub => sub !== callback);
    };
};
// --- End subscription system ---

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
      { status: ComplaintStatus.PENDING, timestamp: new Date(), notes: 'Complaint submitted by citizen and is pending review.', actor: 'System' },
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
    assignedOfficial: { name: 'Ms. Anjali Mehta', photoUrl: 'https://i.pravatar.cc/150?u=anjali' }
  };

  // Add the new complaint to the start of the list so it appears first on the dashboard
  complaints.unshift(newComplaint);
  notify(); // Notify subscribers of the new complaint

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
    const open = allComplaints.filter(c => c.status === ComplaintStatus.PENDING || c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.REOPENED).length;

    const resolved = allComplaints.filter(c => c.status === ComplaintStatus.RESOLVED && c.resolvedAt);
    const totalResolutionTime = resolved.reduce((acc, c) => {
        const resolutionTime = c.resolvedAt!.getTime() - c.submittedAt.getTime();
        return acc + resolutionTime;
    }, 0);
    const avgResolutionMillis = resolved.length > 0 ? totalResolutionTime / resolved.length : 0;
    const avgResolutionHours = (avgResolutionMillis / (1000 * 60 * 60)).toFixed(1);

    // Mock SLA: Any 'In Progress' complaint older than 3 days
    const slaBreaches = allComplaints.filter(c => {
        if (c.status === ComplaintStatus.IN_PROGRESS || c.status === ComplaintStatus.REOPENED) {
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

export const sendFeedbackRequest = async ({
  ticketId,
  contact,
}: {
  ticketId: string;
  contact: string;
}): Promise<number> => {
  return new Promise(resolve => {
    // Simulate sending the SMS
    setTimeout(() => {
      const message = `Dear Citizen, we hope your issue #${ticketId} is resolved. Please rate your satisfaction on a scale of 1 (Poor) to 5 (Excellent) by replying to this message.`;
      console.log(`[FEEDBACK REQUEST SIMULATION]`);
      console.log(`---------------------------`);
      console.log(`Type: SMS`);
      console.log(`To: ${contact}`);
      console.log(`Message: ${message}`);
      console.log(`---------------------------`);

      // Simulate citizen responding after a few seconds
      setTimeout(() => {
          const randomScore = Math.floor(Math.random() * 5) + 1;
          console.log(`[FEEDBACK RECEIVED] For ticket #${ticketId}, citizen responded with a score of: ${randomScore}/5`);
          
          const complaintIndex = complaints.findIndex(c => c.id === ticketId);
          if (complaintIndex !== -1) {
              complaints[complaintIndex].citizenSatisfactionScore = randomScore;
              complaints[complaintIndex].history.push({
                  status: complaints[complaintIndex].status,
                  timestamp: new Date(),
                  notes: `Citizen feedback received: ${randomScore}/5.`,
                  actor: 'System',
              });
              notify(); // Notify subscribers of the change
          }
          resolve(randomScore);
      }, 3000); 

    }, 1000);
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

export const updateComplaintStatus = async (
  complaintId: string,
  newStatus: ComplaintStatus,
  notes: string,
  actor: 'Admin' | 'Citizen' | 'System' = 'Admin'
): Promise<Complaint> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex === -1) {
        return reject(new Error("Complaint not found"));
      }
      
      const updatedComplaint = { ...complaints[complaintIndex] };
      updatedComplaint.status = newStatus;
      updatedComplaint.history = [
        ...updatedComplaint.history,
        { status: newStatus, timestamp: new Date(), notes, actor }
      ];

      // Set/reset resolvedAt timestamp based on status
      if (newStatus === ComplaintStatus.RESOLVED) {
        updatedComplaint.resolvedAt = new Date();
      } else if (newStatus === ComplaintStatus.IN_PROGRESS || newStatus === ComplaintStatus.REOPENED) {
        // This handles reopening a ticket, clearing the old resolution date.
        updatedComplaint.resolvedAt = undefined;
      }

      complaints[complaintIndex] = updatedComplaint;
      
      // Simulate sending a notification for the citizen's action or admin's update
      sendCitizenNotification({
        ticketId: updatedComplaint.id,
        contact: updatedComplaint.contact,
        newStatus: newStatus,
        notes: notes,
      });
      
      notify(); // Notify subscribers of the change
      resolve(updatedComplaint);
    }, 500);
  });
};

export const updateComplaintDepartment = async (
  complaintId: string,
  newDepartment: string,
  adminId: string = "Admin #007" // Mock admin ID
): Promise<Complaint> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex === -1) {
        return reject(new Error("Complaint not found"));
      }
      
      const updatedComplaint = { ...complaints[complaintIndex] };
      updatedComplaint.escalationDept = newDepartment;
      updatedComplaint.history = [
        ...updatedComplaint.history,
        { 
          status: updatedComplaint.status, 
          timestamp: new Date(), 
          notes: `Assigned to ${newDepartment} by ${adminId}.`,
          actor: 'Admin',
        }
      ];

      complaints[complaintIndex] = updatedComplaint;
      notify(); // Notify subscribers of the change
      resolve(updatedComplaint);
    }, 500); // Simulate network delay
  });
};

export const submitSatisfactionFeedback = async (
    complaintId: string,
    rating: number,
    feedback: string,
    photo?: File | null
): Promise<Complaint> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const complaintIndex = complaints.findIndex(c => c.id === complaintId);
            if (complaintIndex === -1) {
                return reject(new Error("Complaint not found"));
            }

            const updatedComplaint = { ...complaints[complaintIndex] };
            updatedComplaint.status = ComplaintStatus.CLOSED;
            updatedComplaint.citizenSatisfactionScore = rating;
            
            if (photo) {
                updatedComplaint.photoAfterUrl = URL.createObjectURL(photo);
            }

            let notes = `Citizen has closed the ticket with a satisfaction rating of ${rating}/5.`;
            if (feedback) {
                notes += ` Feedback: "${feedback}"`;
            }
             if (photo) {
                notes += ` A resolution photo was provided.`;
            }
            
            updatedComplaint.history.push({
                status: ComplaintStatus.CLOSED,
                timestamp: new Date(),
                notes: notes,
                actor: 'Citizen',
            });

            complaints[complaintIndex] = updatedComplaint;
            console.log(`[NOTIFICATION SIMULATION] to Admin: Citizen has closed ticket #${complaintId} with a rating of ${rating}/5.`);
            notify();
            resolve(updatedComplaint);
        }, 1200);
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

  try {
    const base64Image = await fileToBase64(imageFile);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg', // We compress to jpeg, so this is reliable
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
        model: 'gemini-2.5-pro',
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
      
      throw new Error('AI returned an invalid response structure. Please fill details manually.');

    } catch (error: any) {
      console.error('Error analyzing image with Gemini:', error);
      if (error.message.includes('quota')) {
          throw new Error('AI analysis service is temporarily unavailable due to high demand. Please try again later.');
      }
      throw new Error('AI could not analyze the image clearly. Please try again or fill details manually.');
    }
  } catch (fileError) {
    console.error('Error processing file for analysis:', fileError);
    throw new Error('There was a problem reading the image file. Please try uploading it again.');
  }
};

/**
 * AI Service Contract (Simulated Backend Endpoint for Predictive Analytics)
 * Forecasts potential civic issues based on historical data, weather, etc.
 * @param {string} season - The selected season ('Default', 'Monsoon', 'Summer', 'Winter')
 * @returns {Promise<PredictionData>} An object containing AI-driven forecasts.
 */
export const fetchPredictionData = async (season: string = 'Default'): Promise<PredictionData> => {
  console.log(`Fetching AI-powered predictive analytics for season: ${season}...`);
  
  // Base prediction data
  const baseData: PredictionData = {
    cityWideRisk: RiskLevel.HIGH,
    predictedTrafficCongestion: RiskLevel.MEDIUM,
    waterShortageRisk: RiskLevel.LOW,
    topCriticalAreas: [
      { location: 'Ward 5, Near City Park', predictedIssue: 'Waste Management Overflow', severityScore: 85 },
      { location: 'MG Road, Commercial District', predictedIssue: 'Road Damage (Potholes)', severityScore: 78 },
      { location: 'Sector B, Indiranagar', predictedIssue: 'Street Lighting Outages', severityScore: 72 },
      { location: 'Low-lying areas, Ward 9', predictedIssue: 'Water Logging (Monsoon Prep)', severityScore: 65 },
      { location: 'Jayanagar, 3rd Cross', predictedIssue: 'Water Pipeline Stress', severityScore: 68 },
    ],
    expectedCategoryDistribution: [
      { name: 'Waste Mgmt', value: 45 },
      { name: 'Roads', value: 25 },
      { name: 'Water Supply', value: 15 },
      { name: 'Lighting', value: 10 },
      { name: 'Other', value: 5 },
    ],
    actionableRecommendations: [
      "Increase sanitation crew deployment in Ward 5 by 20%.",
      "Conduct pre-monsoon audit of pothole repairs on MG Road.",
      "Schedule proactive maintenance for street light circuits in Indiranagar.",
      "Clear storm-water drains in Ward 9 and alert emergency teams.",
    ],
  };

  // Apply seasonal adjustments
  switch (season) {
    case 'Monsoon':
      baseData.cityWideRisk = RiskLevel.CRITICAL;
      baseData.predictedTrafficCongestion = RiskLevel.HIGH;
      baseData.topCriticalAreas.find(a => a.predictedIssue.includes('Water Logging'))!.severityScore = 95;
      baseData.topCriticalAreas.find(a => a.predictedIssue.includes('Road Damage'))!.severityScore = 88;
      baseData.actionableRecommendations = [
          "Activate monsoon emergency response teams in all wards.",
          "Ensure all storm-water drains in Ward 9 are clear and functional.",
          "Place warning signs near areas prone to water logging on MG Road.",
          "Increase frequency of road quality checks for new pothole formation."
      ];
      baseData.seasonalImpactMessage = "Monsoon Alert: Water logging and pothole formation risk is 85% higher than average. Expect delays.";
      break;
    case 'Summer':
      baseData.cityWideRisk = RiskLevel.HIGH;
      baseData.waterShortageRisk = RiskLevel.CRITICAL;
      baseData.topCriticalAreas.find(a => a.predictedIssue.includes('Water Pipeline'))!.severityScore = 92;
      // Add a new critical area for summer
      baseData.topCriticalAreas.push({ location: 'City-wide (High Density Areas)', predictedIssue: 'Power Outage Risk', severityScore: 80 });
      baseData.actionableRecommendations = [
          "Launch water conservation awareness campaigns across the city.",
          "Increase water supply tanker frequency to Jayanagar and other affected areas.",
          "Coordinate with the electricity board for load-shedding schedules.",
          "Monitor for illegal water connections and pipeline leakages."
      ];
      baseData.seasonalImpactMessage = "Summer Alert: Water shortage risk is critical. Power outage complaints may increase by 40%.";
      break;
    case 'Winter':
      baseData.cityWideRisk = RiskLevel.MEDIUM;
      baseData.predictedTrafficCongestion = RiskLevel.HIGH;
      // Add a new critical area for winter
      baseData.topCriticalAreas.push({ location: 'Major Traffic Junctions', predictedIssue: 'Air Quality Degradation', severityScore: 75 });
      baseData.actionableRecommendations = [
          "Deploy traffic police at major junctions during peak hours to manage fog-related delays.",
          "Issue public health advisories regarding air quality.",
          "Run 'anti-smog gun' vehicles in high-pollution areas.",
          "Check and repair all street lights in Sector B for better visibility."
      ];
      baseData.seasonalImpactMessage = "Winter Advisory: Increased traffic congestion expected due to lower visibility. Air quality may worsen.";
      break;
    default:
      // No changes, return base data
      break;
  }

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(baseData);
    }, 1500);
  });
};


// --- New services for enhanced tracking page ---

export const fetchTransparencyInsights = async (category: string): Promise<{ estimatedTime: string; queuePosition: number; departmentWorkload: number; }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                estimatedTime: '2-3 business days',
                queuePosition: Math.floor(Math.random() * 5) + 1, // Random position from 1 to 5
                departmentWorkload: Math.floor(Math.random() * 20) + 10, // Random workload from 10 to 29
            });
        }, 700);
    });
};

export const fetchSimilarComplaints = async (location: string): Promise<Complaint[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Return 2 random resolved/closed complaints as mock similar issues
            const resolved = complaints.filter(c => c.status === ComplaintStatus.CLOSED || c.status === ComplaintStatus.RESOLVED);
            const shuffled = resolved.sort(() => 0.5 - Math.random());
            resolve(shuffled.slice(0, 2));
        }, 1200);
    });
};

export const addCommentToComplaint = async (complaintId: string, comment: string, additionalPhoto?: File | null): Promise<Complaint> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const complaintIndex = complaints.findIndex(c => c.id === complaintId);
      if (complaintIndex === -1) {
        return reject(new Error("Complaint not found"));
      }
      
      const updatedComplaint = { ...complaints[complaintIndex] };
      let notes = `Citizen comment: "${comment}"`;

      if (additionalPhoto) {
          const photoUrl = URL.createObjectURL(additionalPhoto);
          // In a real app, you'd upload this and store the URL.
          // For now, let's just add it to the notes.
          notes += ` [Additional photo provided: ${photoUrl}]`;
          console.log("Citizen provided additional photo:", photoUrl);
      }

      updatedComplaint.history = [
        ...updatedComplaint.history,
        { status: updatedComplaint.status, timestamp: new Date(), notes, actor: 'Citizen' }
      ];

      complaints[complaintIndex] = updatedComplaint;
      
      console.log(`[NOTIFICATION SIMULATION] to Admin: Citizen added a new comment to ticket #${complaintId}.`);
      notify();
      resolve(updatedComplaint);
    }, 800);
  });
};