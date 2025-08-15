export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          bypass_all_limits: boolean | null
          email: string
        }
        Insert: {
          bypass_all_limits?: boolean | null
          email: string
        }
        Update: {
          bypass_all_limits?: boolean | null
          email?: string
        }
        Relationships: []
      }
      family_accounts: {
        Row: {
          child_age: number | null
          child_name: string
          child_user_id: string
          content_rating: string | null
          created_at: string | null
          daily_time_limit: number | null
          features_enabled: string[] | null
          id: string
          is_active: boolean | null
          parent_user_id: string
          updated_at: string | null
        }
        Insert: {
          child_age?: number | null
          child_name: string
          child_user_id: string
          content_rating?: string | null
          created_at?: string | null
          daily_time_limit?: number | null
          features_enabled?: string[] | null
          id?: string
          is_active?: boolean | null
          parent_user_id: string
          updated_at?: string | null
        }
        Update: {
          child_age?: number | null
          child_name?: string
          child_user_id?: string
          content_rating?: string | null
          created_at?: string | null
          daily_time_limit?: number | null
          features_enabled?: string[] | null
          id?: string
          is_active?: boolean | null
          parent_user_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      founder_program_config: {
        Row: {
          benefits: Json | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          price: number
          remaining_spots: number
          tier_name: string
          updated_at: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          price: number
          remaining_spots?: number
          tier_name: string
          updated_at?: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          price?: number
          remaining_spots?: number
          tier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      founder_waitlist: {
        Row: {
          benefits: Json | null
          created_at: string | null
          email: string
          founder_tier: string
          id: string
          joined_at: string | null
          signup_order: number
          user_id: string | null
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          email: string
          founder_tier: string
          id?: string
          joined_at?: string | null
          signup_order: number
          user_id?: string | null
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          email?: string
          founder_tier?: string
          id?: string
          joined_at?: string | null
          signup_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      latest_features: {
        Row: {
          badge: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_faq: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_sections: {
        Row: {
          content: Json | null
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          section_type: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_type: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          section_type?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_tiers: {
        Row: {
          created_at: string
          currency: string
          custom_styling: Json | null
          description: string | null
          display_order: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          custom_styling?: Json | null
          description?: string | null
          display_order?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          custom_styling?: Json | null
          description?: string | null
          display_order?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          welcome_email_sent: boolean | null
          welcome_email_sent_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          welcome_email_sent?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          welcome_email_sent?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          audio_generation_status: string | null
          created_at: string
          description: string | null
          full_story_audio_url: string | null
          id: string
          is_completed: boolean | null
          is_public: boolean | null
          published_at: string | null
          segment_count: number | null
          shotstack_render_id: string | null
          shotstack_status: string | null
          shotstack_video_url: string | null
          story_mode: string | null
          target_age: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          audio_generation_status?: string | null
          created_at?: string
          description?: string | null
          full_story_audio_url?: string | null
          id?: string
          is_completed?: boolean | null
          is_public?: boolean | null
          published_at?: string | null
          segment_count?: number | null
          shotstack_render_id?: string | null
          shotstack_status?: string | null
          shotstack_video_url?: string | null
          story_mode?: string | null
          target_age?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          audio_generation_status?: string | null
          created_at?: string
          description?: string | null
          full_story_audio_url?: string | null
          id?: string
          is_completed?: boolean | null
          is_public?: boolean | null
          published_at?: string | null
          segment_count?: number | null
          shotstack_render_id?: string | null
          shotstack_status?: string | null
          shotstack_video_url?: string | null
          story_mode?: string | null
          target_age?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      story_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          story_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          story_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          story_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_analytics_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_characters: {
        Row: {
          character_id: string | null
          created_at: string | null
          id: string
          story_id: string | null
        }
        Insert: {
          character_id?: string | null
          created_at?: string | null
          id?: string
          story_id?: string | null
        }
        Update: {
          character_id?: string | null
          created_at?: string | null
          id?: string
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "user_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_characters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_collaborations: {
        Row: {
          accepted_at: string | null
          collaborator_user_id: string
          id: string
          invitation_status: string
          invited_at: string | null
          last_activity: string | null
          owner_user_id: string
          permission_level: string
          story_id: string
        }
        Insert: {
          accepted_at?: string | null
          collaborator_user_id: string
          id?: string
          invitation_status?: string
          invited_at?: string | null
          last_activity?: string | null
          owner_user_id: string
          permission_level?: string
          story_id: string
        }
        Update: {
          accepted_at?: string | null
          collaborator_user_id?: string
          id?: string
          invitation_status?: string
          invited_at?: string | null
          last_activity?: string | null
          owner_user_id?: string
          permission_level?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_collaborations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          story_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          story_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          story_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string | null
          id: string
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_segments: {
        Row: {
          audio_duration: number | null
          audio_generation_status: string | null
          audio_url: string | null
          choices: string[] | null
          created_at: string
          id: string
          image_generation_status: string | null
          image_prompt: string | null
          image_url: string | null
          is_end: boolean | null
          is_image_generating: boolean
          parent_segment_id: string | null
          segment_text: string
          story_id: string
          triggering_choice_text: string | null
          word_count: number | null
        }
        Insert: {
          audio_duration?: number | null
          audio_generation_status?: string | null
          audio_url?: string | null
          choices?: string[] | null
          created_at?: string
          id?: string
          image_generation_status?: string | null
          image_prompt?: string | null
          image_url?: string | null
          is_end?: boolean | null
          is_image_generating?: boolean
          parent_segment_id?: string | null
          segment_text: string
          story_id: string
          triggering_choice_text?: string | null
          word_count?: number | null
        }
        Update: {
          audio_duration?: number | null
          audio_generation_status?: string | null
          audio_url?: string | null
          choices?: string[] | null
          created_at?: string
          id?: string
          image_generation_status?: string | null
          image_prompt?: string | null
          image_url?: string | null
          is_end?: boolean | null
          is_image_generating?: boolean
          parent_segment_id?: string | null
          segment_text?: string
          story_id?: string
          triggering_choice_text?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_segments_parent_segment_id_fkey"
            columns: ["parent_segment_id"]
            isOneToOne: false
            referencedRelation: "story_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_segments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_templates: {
        Row: {
          character_suggestions: Json | null
          created_at: string | null
          description: string | null
          genre: string
          id: string
          is_premium: boolean | null
          name: string
          prompts: string[] | null
          setting_suggestions: Json | null
          template_content: string
          updated_at: string | null
        }
        Insert: {
          character_suggestions?: Json | null
          created_at?: string | null
          description?: string | null
          genre: string
          id?: string
          is_premium?: boolean | null
          name: string
          prompts?: string[] | null
          setting_suggestions?: Json | null
          template_content: string
          updated_at?: string | null
        }
        Update: {
          character_suggestions?: Json | null
          created_at?: string | null
          description?: string | null
          genre?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          prompts?: string[] | null
          setting_suggestions?: Json | null
          template_content?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          created_at: string | null
          email: string
          id: string
          internal_notes: string | null
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          tags: string[] | null
          tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          email: string
          id?: string
          internal_notes?: string | null
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          tags?: string[] | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          email?: string
          id?: string
          internal_notes?: string | null
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          tags?: string[] | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tier_limits: {
        Row: {
          created_at: string | null
          features: string[] | null
          id: string
          images_per_story: number
          stories_per_month: number
          tier_name: string
          voice_generations_per_month: number
          voice_minutes_per_month: number | null
        }
        Insert: {
          created_at?: string | null
          features?: string[] | null
          id?: string
          images_per_story: number
          stories_per_month: number
          tier_name: string
          voice_generations_per_month: number
          voice_minutes_per_month?: number | null
        }
        Update: {
          created_at?: string | null
          features?: string[] | null
          id?: string
          images_per_story?: number
          stories_per_month?: number
          tier_name?: string
          voice_generations_per_month?: number
          voice_minutes_per_month?: number | null
        }
        Relationships: []
      }
      user_characters: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          traits: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          traits?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          traits?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_notes: string | null
          browser_info: Json | null
          created_at: string | null
          email: string | null
          feedback_type: string
          id: string
          message: string
          page_url: string | null
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          browser_info?: Json | null
          created_at?: string | null
          email?: string | null
          feedback_type: string
          id?: string
          message: string
          page_url?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          browser_info?: Json | null
          created_at?: string | null
          email?: string | null
          feedback_type?: string
          id?: string
          message?: string
          page_url?: string | null
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_founders: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          founder_number: number
          founder_tier: string
          id: string
          lifetime_discount: number
          signed_up_at: string | null
          user_id: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          founder_number: number
          founder_tier: string
          id?: string
          lifetime_discount: number
          signed_up_at?: string | null
          user_id: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          founder_number?: number
          founder_tier?: string
          id?: string
          lifetime_discount?: number
          signed_up_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          is_premium: boolean | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_premium?: boolean | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          created_at: string | null
          id: string
          images_generated: number | null
          last_reset: string | null
          month_year: string
          narrated_minutes_used: number | null
          stories_created: number | null
          updated_at: string | null
          user_id: string
          voice_generations: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          images_generated?: number | null
          last_reset?: string | null
          month_year: string
          narrated_minutes_used?: number | null
          stories_created?: number | null
          updated_at?: string | null
          user_id: string
          voice_generations?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          images_generated?: number | null
          last_reset?: string | null
          month_year?: string
          narrated_minutes_used?: number | null
          stories_created?: number | null
          updated_at?: string | null
          user_id?: string
          voice_generations?: number | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          marketing_consent: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          marketing_consent?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          marketing_consent?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_character: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_usage_limit: {
        Args: { user_uuid: string; tier_name: string; check_type: string }
        Returns: boolean
      }
      check_user_subscription: {
        Args: { p_email: string } | { user_id: string }
        Returns: boolean
      }
      get_current_month_usage: {
        Args: { user_uuid: string }
        Returns: {
          stories_created: number
          images_generated: number
          voice_generations: number
          narrated_minutes_used: number
          month_year: string
        }[]
      }
      get_effective_tier: {
        Args: { p_user_id: string }
        Returns: {
          base_tier: string
          effective_tier: string
          subscribed: boolean
          is_active: boolean
          is_founder: boolean
          founder_tier: string
          lifetime_discount: number
        }[]
      }
      get_feedback_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_feedback: number
          new_feedback: number
          in_progress_feedback: number
          resolved_feedback: number
          by_type: Json
        }[]
      }
      get_next_founder_signup: {
        Args: Record<PropertyKey, never>
        Returns: {
          signup_order: number
          founder_tier: string
          benefits: Json
        }[]
      }
      get_public_stories_with_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          description: string
          story_mode: string
          created_at: string
          updated_at: string
          published_at: string
          segment_count: number
          thumbnail_url: string
          is_completed: boolean
          is_public: boolean
          user_id: string
          target_age: string
          audio_generation_status: string
          full_story_audio_url: string
          shotstack_render_id: string
          shotstack_video_url: string
          shotstack_status: string
          latest_generated_image: string
          image_created_at: string
        }[]
      }
      get_user_character_limit: {
        Args: { user_id: string }
        Returns: number
      }
      get_user_subscription: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          user_id: string
          email: string
          subscription_tier: string
          subscription_start: string
          subscription_end: string
          is_active: boolean
          is_founder: boolean
          founder_tier: string
        }[]
      }
      get_waitlist_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_role: {
        Args: { _user_id: string; _role: string } | { role_name: string }
        Returns: boolean
      }
      has_tier_access: {
        Args: { user_uuid: string; required_tier: string }
        Returns: boolean
      }
      increment_usage: {
        Args: {
          user_uuid: string
          stories_inc?: number
          images_inc?: number
          voice_inc?: number
          narrated_minutes_inc?: number
        }
        Returns: {
          stories_created: number
          images_generated: number
          voice_generations: number
          narrated_minutes_used: number
          success: boolean
        }[]
      }
      join_founder_waitlist: {
        Args: Record<PropertyKey, never>
        Returns: {
          success: boolean
          signup_order: number
          founder_tier: string
          benefits: Json
          message: string
        }[]
      }
      match_user_id: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_updated_at_column_void: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
