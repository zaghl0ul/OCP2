import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAdaptiveUIStore = create(
  persist(
    (set, get) => ({
      // Living UI State
      personality: {
        name: 'Clippy',
        mood: 'friendly', // friendly, focused, energetic, calm, playful
        energy: 100,
        experience: 0,
        traits: {
          helpfulness: 0.8,
          creativity: 0.7,
          efficiency: 0.6,
          playfulness: 0.5,
        }
      },
      
      // UI State
      uiState: {
        isBreathing: true,
        ambientParticles: true,
        dynamicTheme: true,
        currentTheme: 'aurora', // aurora, sunset, ocean, forest, space
        timeOfDay: 'day', // dawn, day, dusk, night
        activityLevel: 'normal', // idle, low, normal, high, intense
        focusMode: false,
      },
      
      // Learning state
      isLearning: false,
      learningProgress: 0,
      
      // User behavior patterns
      userPatterns: {
        preferredClipLength: 30,
        frequentTools: [],
        interactionZones: [],
        workflowPatterns: [],
        exportTargets: ['mp4'],
        analysisPromptTypes: [],
        activityTimes: {}, // Track when user is most active
        moodPreferences: {}, // Track which moods user responds to
        interactionSpeed: 'normal', // slow, normal, fast
        skillLevel: 'intermediate', // beginner, intermediate, expert
      },
      
      // UI adaptations
      adaptations: {
        toolbarLayout: 'default',
        prioritizedFeatures: [],
        hiddenFeatures: [],
        suggestedFeatures: [],
        customShortcuts: {},
        layoutPreferences: {
          sidebarWidth: 280,
          timelineHeight: 200,
          previewSize: 'medium',
        },
        animations: {
          speed: 1,
          complexity: 'medium', // low, medium, high
          particles: true,
          glow: true,
          transitions: true,
        },
      },
      
      // Interaction tracking
      interactions: [],
      sessionData: {
        startTime: null,
        totalClicks: 0,
        featuresUsed: {},
        timeSpentInAreas: {},
        moodResponses: {},
        lastActivity: null,
      },
      
      // Predictions
      predictions: {
        nextAction: null,
        suggestedTools: [],
        workflowHints: [],
        timeToComplete: null,
      },
      
      // Actions
      initializeAdaptiveUI: () => {
        const now = new Date()
        const hour = now.getHours()
        let timeOfDay = 'day'
        let mood = 'friendly'
        
        // Set time of day and mood
        if (hour >= 5 && hour < 9) {
          timeOfDay = 'dawn'
          mood = 'calm'
        } else if (hour >= 9 && hour < 17) {
          timeOfDay = 'day'
          mood = 'energetic'
        } else if (hour >= 17 && hour < 20) {
          timeOfDay = 'dusk'
          mood = 'focused'
        } else {
          timeOfDay = 'night'
          mood = 'calm'
        }
        
        set({
          sessionData: {
            startTime: Date.now(),
            totalClicks: 0,
            featuresUsed: {},
            timeSpentInAreas: {},
            moodResponses: {},
            lastActivity: Date.now(),
          },
          uiState: {
            ...get().uiState,
            timeOfDay,
          },
          personality: {
            ...get().personality,
            mood,
          },
        })
        
        // Start ambient animations
        get().startAmbientAnimations()
      },
      
      trackInteraction: (interaction) => {
        const state = get()
        const now = Date.now()
        const timeSinceLastActivity = now - (state.sessionData.lastActivity || now)
        
        // Update activity level
        let activityLevel = 'normal'
        if (timeSinceLastActivity < 500) activityLevel = 'intense'
        else if (timeSinceLastActivity < 2000) activityLevel = 'high'
        else if (timeSinceLastActivity > 30000) activityLevel = 'idle'
        
        const newInteraction = {
          ...interaction,
          timestamp: now,
          sessionId: state.sessionData.startTime,
          mood: state.personality.mood,
          energy: state.personality.energy,
        }
        
        set((state) => ({
          interactions: [...state.interactions.slice(-999), newInteraction],
          sessionData: {
            ...state.sessionData,
            totalClicks: state.sessionData.totalClicks + 1,
            featuresUsed: {
              ...state.sessionData.featuresUsed,
              [interaction.feature]: (state.sessionData.featuresUsed[interaction.feature] || 0) + 1,
            },
            lastActivity: now,
          },
          uiState: {
            ...state.uiState,
            activityLevel,
          },
        }))
        
        // Update personality energy
        get().updatePersonalityEnergy(-0.5)
        
        // Trigger learning periodically
        if (state.interactions.length > 0 && state.interactions.length % 20 === 0) {
          get().analyzePatterns()
        }
        
        // Make predictions
        get().predictNextAction()
      },
      
      updatePersonalityEnergy: (delta) => {
        set((state) => ({
          personality: {
            ...state.personality,
            energy: Math.max(0, Math.min(100, state.personality.energy + delta)),
          },
        }))
        
        // Update mood based on energy
        const energy = get().personality.energy
        if (energy < 20) {
          get().updatePersonalityMood('calm')
        } else if (energy > 80 && get().uiState.activityLevel === 'high') {
          get().updatePersonalityMood('energetic')
        }
      },
      
      updatePersonalityMood: (mood) => {
        const validMoods = ['friendly', 'focused', 'energetic', 'calm', 'playful']
        if (validMoods.includes(mood)) {
          set((state) => ({
            personality: {
              ...state.personality,
              mood,
            },
          }))
          
          // Track mood preferences
          const moodResponses = get().sessionData.moodResponses
          moodResponses[mood] = (moodResponses[mood] || 0) + 1
        }
      },
      
      analyzePatterns: async () => {
        const state = get()
        set({ isLearning: true, learningProgress: 0 })
        
        try {
          // Simulate progressive learning
          for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 200))
            set({ learningProgress: i })
          }
          
          const interactions = state.interactions.slice(-200)
          
          // Analyze frequent tools
          const toolUsage = {}
          interactions.forEach(interaction => {
            if (interaction.type === 'tool_use') {
              toolUsage[interaction.feature] = (toolUsage[interaction.feature] || 0) + 1
            }
          })
          
          const frequentTools = Object.entries(toolUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([tool]) => tool)
          
          // Analyze interaction speed
          const clickIntervals = []
          for (let i = 1; i < interactions.length; i++) {
            if (interactions[i].type === 'click' && interactions[i-1].type === 'click') {
              clickIntervals.push(interactions[i].timestamp - interactions[i-1].timestamp)
            }
          }
          
          const avgInterval = clickIntervals.length > 0 
            ? clickIntervals.reduce((a, b) => a + b, 0) / clickIntervals.length
            : 3000
          
          const interactionSpeed = avgInterval < 1000 ? 'fast' : avgInterval > 5000 ? 'slow' : 'normal'
          
          // Analyze skill level based on feature usage diversity
          const uniqueFeatures = Object.keys(state.sessionData.featuresUsed).length
          const skillLevel = uniqueFeatures > 15 ? 'expert' : uniqueFeatures > 8 ? 'intermediate' : 'beginner'
          
          // Update patterns and adaptations
          set((state) => ({
            userPatterns: {
              ...state.userPatterns,
              frequentTools,
              interactionSpeed,
              skillLevel,
            },
            adaptations: {
              ...state.adaptations,
              prioritizedFeatures: frequentTools,
              animations: {
                ...state.adaptations.animations,
                speed: interactionSpeed === 'fast' ? 1.5 : interactionSpeed === 'slow' ? 0.8 : 1,
                complexity: skillLevel === 'expert' ? 'high' : skillLevel === 'beginner' ? 'low' : 'medium',
              },
            },
            personality: {
              ...state.personality,
              experience: Math.min(100, state.personality.experience + 5),
            },
          }))
          
          // Update personality traits based on usage
          get().evolvPersonality()
          
        } catch (error) {
          console.error('Pattern analysis failed:', error)
        } finally {
          set({ isLearning: false, learningProgress: 100 })
        }
      },
      
      evolvPersonality: () => {
        const state = get()
        const { frequentTools, skillLevel } = state.userPatterns
        
        // Evolve traits based on usage patterns
        const traits = { ...state.personality.traits }
        
        // Increase efficiency if user is fast
        if (state.userPatterns.interactionSpeed === 'fast') {
          traits.efficiency = Math.min(1, traits.efficiency + 0.05)
        }
        
        // Increase creativity if user explores many features
        if (frequentTools.length > 3) {
          traits.creativity = Math.min(1, traits.creativity + 0.03)
        }
        
        // Adjust helpfulness based on skill level
        if (skillLevel === 'beginner') {
          traits.helpfulness = Math.min(1, traits.helpfulness + 0.05)
        } else if (skillLevel === 'expert') {
          traits.helpfulness = Math.max(0.5, traits.helpfulness - 0.02)
        }
        
        set((state) => ({
          personality: {
            ...state.personality,
            traits,
          },
        }))
      },
      
      predictNextAction: () => {
        const state = get()
        const recentInteractions = state.interactions.slice(-10)
        
        // Simple pattern matching for workflow prediction
        const workflowPatterns = [
          { pattern: ['upload', 'analyze'], next: 'edit_clips', confidence: 0.8 },
          { pattern: ['edit_clips', 'save'], next: 'export', confidence: 0.7 },
          { pattern: ['create_project'], next: 'upload', confidence: 0.9 },
        ]
        
        // Check if recent actions match any pattern
        for (const wp of workflowPatterns) {
          const recentFeatures = recentInteractions.map(i => i.feature)
          const patternMatch = wp.pattern.every((step, i) => 
            recentFeatures[recentFeatures.length - wp.pattern.length + i] === step
          )
          
          if (patternMatch) {
            set((state) => ({
              predictions: {
                ...state.predictions,
                nextAction: {
                  action: wp.next,
                  confidence: wp.confidence,
                  suggestion: `Ready to ${wp.next.replace('_', ' ')}?`,
                },
              },
            }))
            break
          }
        }
      },
      
      startAmbientAnimations: () => {
        // This would trigger CSS animations and particle effects
        set((state) => ({
          uiState: {
            ...state.uiState,
            isBreathing: true,
            ambientParticles: true,
          },
        }))
      },
      
      toggleFocusMode: () => {
        const focusMode = !get().uiState.focusMode
        set((state) => ({
          uiState: {
            ...state.uiState,
            focusMode,
            ambientParticles: !focusMode, // Disable distractions in focus mode
          },
          personality: {
            ...state.personality,
            mood: focusMode ? 'focused' : 'friendly',
            },
        }))
      },
      
      updateTheme: (theme) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            currentTheme: theme,
          },
        }))
      },
      
      getPersonalityMessage: () => {
        const { mood, energy, traits, name } = get().personality
        const messages = {
          friendly: [
            "Hey there! Ready to create something amazing?",
            "I'm here to help whenever you need me!",
            "Looking good! Keep up the great work!",
          ],
          focused: [
            "Let's get this done efficiently.",
            "I'll keep distractions minimal.",
            "Focus mode activated. You've got this!",
          ],
          energetic: [
            "Wow, you're on fire today! 🔥",
            "This is exciting! What's next?",
            "Your energy is contagious!",
          ],
          calm: [
            "Take your time, no rush.",
            "Nice and steady wins the race.",
            "Enjoying the peaceful workflow?",
          ],
          playful: [
            "Ooh, what if we tried something fun?",
            "I've got a creative idea for you!",
            "Let's add some sparkle to this! ✨",
          ],
        }
        
        const moodMessages = messages[mood] || messages.friendly
        const index = Math.floor(Math.random() * moodMessages.length)
        
        return {
          text: moodMessages[index],
          energy,
          mood,
        }
      },
      
      getAdaptiveRecommendations: () => {
        const state = get()
        const recommendations = []
        
        // Recommend based on time of day
        if (state.uiState.timeOfDay === 'night') {
          recommendations.push({
            type: 'theme',
            icon: '🌙',
            message: 'Switch to dark theme for easier viewing?',
            action: () => get().updateTheme('space'),
          })
        }
        
        // Recommend based on activity level
        if (state.uiState.activityLevel === 'intense') {
          recommendations.push({
            type: 'performance',
            icon: '⚡',
            message: 'Enable focus mode for better performance?',
            action: () => get().toggleFocusMode(),
          })
        }
        
        // Recommend based on skill level
        if (state.userPatterns.skillLevel === 'beginner') {
          recommendations.push({
            type: 'tutorial',
            icon: '🎓',
            message: 'Would you like some tips on using advanced features?',
            action: () => {/* Show tutorial */},
          })
        }
        
        // Energy-based recommendations
        if (state.personality.energy < 30) {
          recommendations.push({
            type: 'break',
            icon: '☕',
            message: "You've been working hard! Time for a quick break?",
            action: () => {/* Trigger break reminder */},
          })
        }
        
        return recommendations
      },
      
      resetAdaptations: () => {
        set({
          userPatterns: {
            preferredClipLength: 30,
            frequentTools: [],
            interactionZones: [],
            workflowPatterns: [],
            exportTargets: ['mp4'],
            analysisPromptTypes: [],
            activityTimes: {},
            moodPreferences: {},
            interactionSpeed: 'normal',
            skillLevel: 'intermediate',
          },
          adaptations: {
            toolbarLayout: 'default',
            prioritizedFeatures: [],
            hiddenFeatures: [],
            suggestedFeatures: [],
            customShortcuts: {},
            layoutPreferences: {
              sidebarWidth: 280,
              timelineHeight: 200,
              previewSize: 'medium',
            },
            animations: {
              speed: 1,
              complexity: 'medium',
              particles: true,
              glow: true,
              transitions: true,
            },
          },
          interactions: [],
          personality: {
            name: 'Clippy',
            mood: 'friendly',
            energy: 100,
            experience: 0,
            traits: {
              helpfulness: 0.8,
              creativity: 0.7,
              efficiency: 0.6,
              playfulness: 0.5,
            },
          },
        })
      },
    }),
    {
      name: 'adaptive-ui-store',
      partialize: (state) => ({
        userPatterns: state.userPatterns,
        adaptations: state.adaptations,
        personality: state.personality,
      }),
    }
  )
)

export { useAdaptiveUIStore }