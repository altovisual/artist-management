export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          bio: string | null
          country: string
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          genre: string
          id: string
          last_name: string | null
          monthly_listeners: number | null
          name: string
          participant_id: string | null
          phone: string | null
          profile_image: string | null
          spotify_artist_id: string | null
          total_streams: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          country: string
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre: string
          id?: string
          last_name?: string | null
          monthly_listeners?: number | null
          name: string
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          country?: string
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string
          id?: string
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_artists_participant"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      artists_backup_before_simple_restore: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          genre: string | null
          id: string | null
          last_name: string | null
          monthly_listeners: number | null
          name: string | null
          participant_id: string | null
          phone: string | null
          profile_image: string | null
          spotify_artist_id: string | null
          total_streams: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      artists_backup_emergency_20250927: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          genre: string | null
          id: string | null
          last_name: string | null
          monthly_listeners: number | null
          name: string | null
          participant_id: string | null
          phone: string | null
          profile_image: string | null
          spotify_artist_id: string | null
          total_streams: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      artists_before_complete_restore: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          genre: string | null
          id: string | null
          last_name: string | null
          monthly_listeners: number | null
          name: string | null
          participant_id: string | null
          phone: string | null
          profile_image: string | null
          spotify_artist_id: string | null
          total_streams: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      artists_before_restore_20250927: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          genre: string | null
          id: string | null
          last_name: string | null
          monthly_listeners: number | null
          name: string | null
          participant_id: string | null
          phone: string | null
          profile_image: string | null
          spotify_artist_id: string | null
          total_streams: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      artists_temp_backup: {
        Row: {
          bio: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          genre: string | null
          id: string | null
          last_name: string | null
          monthly_listeners: number | null
          name: string | null
          participant_id: string | null
          phone: string | null
          profile_image: string | null
          spotify_artist_id: string | null
          total_streams: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          genre?: string | null
          id?: string | null
          last_name?: string | null
          monthly_listeners?: number | null
          name?: string | null
          participant_id?: string | null
          phone?: string | null
          profile_image?: string | null
          spotify_artist_id?: string | null
          total_streams?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          artist_id: string
          category: string
          created_at: string | null
          description: string | null
          dimensions: string | null
          file_size: number | null
          file_url: string
          format: string | null
          id: string
          name: string
          project_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          category: string
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          file_size?: number | null
          file_url: string
          format?: string | null
          id?: string
          name: string
          project_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          dimensions?: string | null
          file_size?: number | null
          file_url?: string
          format?: string | null
          id?: string
          name?: string
          project_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audience_reports: {
        Row: {
          artist_id: string | null
          created_at: string
          followers: number | null
          id: number
          listeners: number | null
          report_date: string
          streams: number | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          followers?: number | null
          id?: number
          listeners?: number | null
          report_date: string
          streams?: number | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          followers?: number | null
          id?: number
          listeners?: number | null
          report_date?: string
          streams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audience_reports_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_participants: {
        Row: {
          contract_id: number
          participant_id: string
          percentage: number | null
          role: string
        }
        Insert: {
          contract_id: number
          participant_id: string
          percentage?: number | null
          role: string
        }
        Update: {
          contract_id?: number
          participant_id?: string
          percentage?: number | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_participants_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          additional_notes: string | null
          auco_document_id: string | null
          co_publishers: string | null
          created_at: string
          final_contract_pdf_url: string | null
          id: number
          internal_reference: string | null
          project_id: string
          publisher: string | null
          publisher_admin: string | null
          publisher_percentage: number | null
          signed_at: string | null
          signing_location: string | null
          status: Database["public"]["Enums"]["contract_status"]
          template_id: number
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          auco_document_id?: string | null
          co_publishers?: string | null
          created_at?: string
          final_contract_pdf_url?: string | null
          id?: never
          internal_reference?: string | null
          project_id: string
          publisher?: string | null
          publisher_admin?: string | null
          publisher_percentage?: number | null
          signed_at?: string | null
          signing_location?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          template_id: number
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          auco_document_id?: string | null
          co_publishers?: string | null
          created_at?: string
          final_contract_pdf_url?: string | null
          id?: never
          internal_reference?: string | null
          project_id?: string
          publisher?: string | null
          publisher_admin?: string | null
          publisher_percentage?: number | null
          signed_at?: string | null
          signing_location?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          template_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_work_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_vault_items: {
        Row: {
          artist_id: string
          content: string | null
          created_at: string | null
          file_url: string | null
          id: string
          notes: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_vault_items_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_accounts: {
        Row: {
          access_token: string | null
          access_token_encrypted: string | null
          account_id: string | null
          analytics_status: string | null
          artist_id: string
          created_at: string | null
          created_by: string | null
          distributor: string
          email: string | null
          id: string
          last_synced_at: string | null
          monthly_listeners: number | null
          notes: string | null
          password: string | null
          platform: string | null
          provider: string | null
          refresh_token: string | null
          service: string
          token_expires_at: string | null
          updated_at: string | null
          url: string | null
          username: string | null
        }
        Insert: {
          access_token?: string | null
          access_token_encrypted?: string | null
          account_id?: string | null
          analytics_status?: string | null
          artist_id: string
          created_at?: string | null
          created_by?: string | null
          distributor: string
          email?: string | null
          id?: string
          last_synced_at?: string | null
          monthly_listeners?: number | null
          notes?: string | null
          password?: string | null
          platform?: string | null
          provider?: string | null
          refresh_token?: string | null
          service: string
          token_expires_at?: string | null
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Update: {
          access_token?: string | null
          access_token_encrypted?: string | null
          account_id?: string | null
          analytics_status?: string | null
          artist_id?: string
          created_at?: string | null
          created_by?: string | null
          distributor?: string
          email?: string | null
          id?: string
          last_synced_at?: string | null
          monthly_listeners?: number | null
          notes?: string | null
          password?: string | null
          platform?: string | null
          provider?: string | null
          refresh_token?: string | null
          service?: string
          token_expires_at?: string | null
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_accounts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean
          artist_id: string
          category: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          project_id: string | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          artist_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          project_id?: string | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          artist_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          project_id?: string | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      keep_alive_logs: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string | null
        }
        Relationships: []
      }
      muso_ai_profiles: {
        Row: {
          artist_id: string | null
          created_at: string | null
          id: string
          last_updated: string | null
          muso_ai_profile_id: string
          popularity: number | null
          profile_data: Json | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          muso_ai_profile_id: string
          popularity?: number | null
          profile_data?: Json | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          muso_ai_profile_id?: string
          popularity?: number | null
          profile_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "muso_ai_profiles_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_state: {
        Row: {
          created_at: string
          distribution_account_id: string | null
          state: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          distribution_account_id?: string | null
          state: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          distribution_account_id?: string | null
          state?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_state_distribution_account_id_fkey"
            columns: ["distribution_account_id"]
            isOneToOne: false
            referencedRelation: "distribution_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          address: string | null
          artistic_name: string | null
          auco_verification_id: string | null
          bank_info: Json | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          id_number: string | null
          ipi: string | null
          management_entity: string | null
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["participant_type"]
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          address?: string | null
          artistic_name?: string | null
          auco_verification_id?: string | null
          bank_info?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          ipi?: string | null
          management_entity?: string | null
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["participant_type"]
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          address?: string | null
          artistic_name?: string | null
          auco_verification_id?: string | null
          bank_info?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          ipi?: string | null
          management_entity?: string | null
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["participant_type"]
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          alternative_title: string | null
          artist_id: string
          composers: string[] | null
          cover_art_url: string | null
          created_at: string | null
          credits: string | null
          description: string | null
          duration: number | null
          genre: string | null
          id: string
          isrc: string | null
          iswc: string | null
          lyrics: string | null
          music_file_url: string | null
          name: string
          notes: string | null
          producers: string[] | null
          release_date: string | null
          splits: Json | null
          status: Database["public"]["Enums"]["project_status"]
          type: Database["public"]["Enums"]["project_type"]
          upc: string | null
          updated_at: string | null
        }
        Insert: {
          alternative_title?: string | null
          artist_id: string
          composers?: string[] | null
          cover_art_url?: string | null
          created_at?: string | null
          credits?: string | null
          description?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          lyrics?: string | null
          music_file_url?: string | null
          name: string
          notes?: string | null
          producers?: string[] | null
          release_date?: string | null
          splits?: Json | null
          status?: Database["public"]["Enums"]["project_status"]
          type: Database["public"]["Enums"]["project_type"]
          upc?: string | null
          updated_at?: string | null
        }
        Update: {
          alternative_title?: string | null
          artist_id?: string
          composers?: string[] | null
          cover_art_url?: string | null
          created_at?: string | null
          credits?: string | null
          description?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          isrc?: string | null
          iswc?: string | null
          lyrics?: string | null
          music_file_url?: string | null
          name?: string
          notes?: string | null
          producers?: string[] | null
          release_date?: string | null
          splits?: Json | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          upc?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      royalties: {
        Row: {
          artist_id: string | null
          country: string
          id: number
          isrc: string | null
          platform: string
          quantity: number | null
          report_id: string
          revenue: number
          song_title: string
        }
        Insert: {
          artist_id?: string | null
          country: string
          id?: number
          isrc?: string | null
          platform: string
          quantity?: number | null
          report_id: string
          revenue: number
          song_title: string
        }
        Update: {
          artist_id?: string | null
          country?: string
          id?: number
          isrc?: string | null
          platform?: string
          quantity?: number | null
          report_id?: string
          revenue?: number
          song_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "royalties_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalties_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "royalty_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      royalty_reports: {
        Row: {
          created_at: string
          file_name: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      signatures: {
        Row: {
          contract_id: number
          created_at: string
          id: number
          signature_request_id: string
          signed_at: string | null
          signer_email: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contract_id: number
          created_at?: string
          id?: never
          signature_request_id: string
          signed_at?: string | null
          signer_email?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contract_id?: number
          created_at?: string
          id?: never
          signature_request_id?: string
          signed_at?: string | null
          signer_email?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          artist_id: string
          created_at: string | null
          created_by: string | null
          email: string | null
          followers: number | null
          handle: string | null
          id: string
          password: string | null
          password_encrypted: string | null
          platform: string
          updated_at: string | null
          url: string | null
          username: string
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          followers?: number | null
          handle?: string | null
          id?: string
          password?: string | null
          password_encrypted?: string | null
          platform: string
          updated_at?: string | null
          url?: string | null
          username: string
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          followers?: number | null
          handle?: string | null
          id?: string
          password?: string | null
          password_encrypted?: string | null
          platform?: string
          updated_at?: string | null
          url?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          auco_template_id: string | null
          id: number
          jurisdiction: string | null
          language: string
          type: string
          version: string
        }
        Insert: {
          auco_template_id?: string | null
          id?: never
          jurisdiction?: string | null
          language: string
          type: string
          version: string
        }
        Update: {
          auco_template_id?: string | null
          id?: never
          jurisdiction?: string | null
          language?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          artist_id: string
          category_id: string
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          artist_id: string
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          transaction_date: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          artist_id?: string
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      work_participants: {
        Row: {
          created_at: string | null
          participant_id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          participant_id: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          participant_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_participants_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_artists_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          id: string
          role: string
        }[]
      }
      get_all_users_for_app: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          id: string
          raw_user_meta_data: Json
        }[]
      }
      get_contracts_with_details: {
        Args: { is_admin: boolean; user_id_param: string }
        Returns: {
          created_at: string
          id: string
          participants: Json
          status: string
          template_id: number
          template_type: string
          template_version: string
          updated_at: string
          work_id: string
          work_name: string
        }[]
      }
      get_db_size_mb: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      contract_status: "draft" | "sent" | "signed" | "expired" | "archived"
      participant_type:
        | "ARTISTA"
        | "PRODUCTOR"
        | "COMPOSITOR"
        | "MANAGER"
        | "LAWYER"
      project_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "released"
        | "cancelled"
      project_type: "single" | "album" | "ep" | "mixtape"
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
    Enums: {
      contract_status: ["draft", "sent", "signed", "expired", "archived"],
      participant_type: [
        "ARTISTA",
        "PRODUCTOR",
        "COMPOSITOR",
        "MANAGER",
        "LAWYER",
      ],
      project_status: [
        "planned",
        "in_progress",
        "completed",
        "released",
        "cancelled",
      ],
      project_type: ["single", "album", "ep", "mixtape"],
    },
  },
} as const
