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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campanhas: {
        Row: {
          ativo: boolean
          conteudo: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          meta_cents: number
          ordem: number
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          meta_cents?: number
          ordem?: number
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          conteudo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          meta_cents?: number
          ordem?: number
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          division_id: string
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          meetings: string | null
          name: string
          order_index: number
          phone: string | null
          president: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          division_id: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name: string
          order_index?: number
          phone?: string | null
          president?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          division_id?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name?: string
          order_index?: number
          phone?: string | null
          president?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      con_lancamento_itens: {
        Row: {
          conta_id: string
          created_at: string
          historico_complementar: string | null
          id: string
          lancamento_id: string
          tipo: string
          valor: number
        }
        Insert: {
          conta_id: string
          created_at?: string
          historico_complementar?: string | null
          id?: string
          lancamento_id: string
          tipo: string
          valor?: number
        }
        Update: {
          conta_id?: string
          created_at?: string
          historico_complementar?: string | null
          id?: string
          lancamento_id?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "con_lancamento_itens_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "con_plano_contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "con_lancamento_itens_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "con_lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      con_lancamentos: {
        Row: {
          competencia: string | null
          created_at: string
          criado_por: string | null
          data: string
          historico: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          competencia?: string | null
          created_at?: string
          criado_por?: string | null
          data: string
          historico: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          competencia?: string | null
          created_at?: string
          criado_por?: string | null
          data?: string
          historico?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      con_plano_contas: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          id: string
          natureza: string
          nivel: number
          nome: string
          pai_id: string | null
          sintetica: boolean
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          id?: string
          natureza: string
          nivel?: number
          nome: string
          pai_id?: string | null
          sintetica?: boolean
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          id?: string
          natureza?: string
          nivel?: number
          nome?: string
          pai_id?: string | null
          sintetica?: boolean
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "con_plano_contas_pai_id_fkey"
            columns: ["pai_id"]
            isOneToOne: false
            referencedRelation: "con_plano_contas"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contatos: {
        Row: {
          cargo: string | null
          clube_nome: string | null
          created_at: string
          email: string | null
          estagio_funil: string
          id: string
          nome: string
          observacoes: string | null
          origem: string | null
          status: string
          telefone: string | null
          tipo: string
          updated_at: string
          valor_estimado: number
          whatsapp: string | null
        }
        Insert: {
          cargo?: string | null
          clube_nome?: string | null
          created_at?: string
          email?: string | null
          estagio_funil?: string
          id?: string
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
          valor_estimado?: number
          whatsapp?: string | null
        }
        Update: {
          cargo?: string | null
          clube_nome?: string | null
          created_at?: string
          email?: string | null
          estagio_funil?: string
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
          valor_estimado?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      crm_interacoes: {
        Row: {
          contato_id: string
          created_at: string
          descricao: string | null
          id: string
          registrado_por: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          contato_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          registrado_por?: string | null
          tipo?: string
          titulo: string
        }
        Update: {
          contato_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          registrado_por?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_interacoes_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "crm_contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tarefas_followup: {
        Row: {
          concluida_em: string | null
          contato_id: string
          created_at: string
          data_vencimento: string
          descricao: string | null
          id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          concluida_em?: string | null
          contato_id: string
          created_at?: string
          data_vencimento: string
          descricao?: string | null
          id?: string
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          concluida_em?: string | null
          contato_id?: string
          created_at?: string
          data_vencimento?: string
          descricao?: string | null
          id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tarefas_followup_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "crm_contatos"
            referencedColumns: ["id"]
          },
        ]
      }
      dist_associado_cargos: {
        Row: {
          ambito: string
          ano_leonico: string | null
          associado_id: string
          atual: boolean
          cargo: string
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          id: string
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          ambito?: string
          ano_leonico?: string | null
          associado_id: string
          atual?: boolean
          cargo: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          ambito?: string
          ano_leonico?: string | null
          associado_id?: string
          atual?: boolean
          cargo?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          observacoes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dist_associado_cargos_associado_id_fkey"
            columns: ["associado_id"]
            isOneToOne: false
            referencedRelation: "dist_associados"
            referencedColumns: ["id"]
          },
        ]
      }
      dist_associados: {
        Row: {
          bairro: string | null
          bio: string | null
          cargo_clube: string
          cargo_distrital: string | null
          categoria: string
          cep: string | null
          cidade: string | null
          cidade_endereco: string | null
          clube_id: string
          complemento: string | null
          cpf: string | null
          created_at: string
          data_admissao: string | null
          data_nascimento: string | null
          email: string | null
          estado_uf: string | null
          foto_url: string | null
          id: string
          logradouro: string | null
          nome: string
          nome_conjuge: string | null
          numero: string | null
          status: string
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          bairro?: string | null
          bio?: string | null
          cargo_clube?: string
          cargo_distrital?: string | null
          categoria?: string
          cep?: string | null
          cidade?: string | null
          cidade_endereco?: string | null
          clube_id: string
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_uf?: string | null
          foto_url?: string | null
          id?: string
          logradouro?: string | null
          nome: string
          nome_conjuge?: string | null
          numero?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          bairro?: string | null
          bio?: string | null
          cargo_clube?: string
          cargo_distrital?: string | null
          categoria?: string
          cep?: string | null
          cidade?: string | null
          cidade_endereco?: string | null
          clube_id?: string
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          data_admissao?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_uf?: string | null
          foto_url?: string | null
          id?: string
          logradouro?: string | null
          nome?: string
          nome_conjuge?: string | null
          numero?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dist_associados_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "dist_clubes"
            referencedColumns: ["id"]
          },
        ]
      }
      dist_clubes: {
        Row: {
          cep: string | null
          charter_date: string | null
          cidade: string
          codigo_lions: string | null
          created_at: string
          dia_reuniao: string | null
          divisao: string
          email: string | null
          endereco: string | null
          estado: string
          horario_reuniao: string | null
          id: string
          local_reuniao: string | null
          nome: string
          observacoes: string | null
          regiao: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          charter_date?: string | null
          cidade?: string
          codigo_lions?: string | null
          created_at?: string
          dia_reuniao?: string | null
          divisao?: string
          email?: string | null
          endereco?: string | null
          estado?: string
          horario_reuniao?: string | null
          id?: string
          local_reuniao?: string | null
          nome: string
          observacoes?: string | null
          regiao?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          charter_date?: string | null
          cidade?: string
          codigo_lions?: string | null
          created_at?: string
          dia_reuniao?: string | null
          divisao?: string
          email?: string | null
          endereco?: string | null
          estado?: string
          horario_reuniao?: string | null
          id?: string
          local_reuniao?: string | null
          nome?: string
          observacoes?: string | null
          regiao?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dist_documentos_informativos: {
        Row: {
          arquivo_nome: string
          arquivo_tamanho: string | null
          arquivo_url: string
          autor_cargo: string
          categoria: string
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivo_nome: string
          arquivo_tamanho?: string | null
          arquivo_url: string
          autor_cargo?: string
          categoria?: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivo_nome?: string
          arquivo_tamanho?: string | null
          arquivo_url?: string
          autor_cargo?: string
          categoria?: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      dist_estrutura_cargos: {
        Row: {
          ano_leonico: string
          cargo_nome: string
          categoria_estrutura: string
          clube_origem: string | null
          created_at: string
          email: string | null
          id: string
          nome_titular: string
          ordem: number
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ano_leonico?: string
          cargo_nome: string
          categoria_estrutura?: string
          clube_origem?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome_titular: string
          ordem?: number
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ano_leonico?: string
          cargo_nome?: string
          categoria_estrutura?: string
          clube_origem?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome_titular?: string
          ordem?: number
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dist_nominata_clube: {
        Row: {
          ano_leonico: string
          cargo: string
          clube_id: string
          created_at: string
          email: string | null
          id: string
          nome_oficial: string
          telefone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ano_leonico?: string
          cargo: string
          clube_id: string
          created_at?: string
          email?: string | null
          id?: string
          nome_oficial: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ano_leonico?: string
          cargo?: string
          clube_id?: string
          created_at?: string
          email?: string | null
          id?: string
          nome_oficial?: string
          telefone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dist_nominata_clube_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "dist_clubes"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          president_name: string | null
          president_photo_url: string | null
          region_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          president_name?: string | null
          president_photo_url?: string | null
          region_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          president_name?: string | null
          president_photo_url?: string | null
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "divisions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      document_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          document_id: string | null
          document_title: string
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          document_id?: string | null
          document_title: string
          id?: string
          user_email: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          document_id?: string | null
          document_title?: string
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_audit_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          is_restricted: boolean | null
          required_role: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_restricted?: boolean | null
          required_role?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_restricted?: boolean | null
          required_role?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donation_subscriptions: {
        Row: {
          amount_cents: number
          cancel_at_period_end: boolean
          created_at: string
          currency: string
          current_period_end: string | null
          customer_email: string | null
          customer_name: string | null
          environment: string
          id: string
          price_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          customer_email?: string | null
          customer_name?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          cancel_at_period_end?: boolean
          created_at?: string
          currency?: string
          current_period_end?: string | null
          customer_email?: string | null
          customer_name?: string | null
          environment?: string
          id?: string
          price_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          description: string | null
          environment: string
          id: string
          kind: string
          payment_status: string
          raw_event: Json | null
          receipt_number: string
          reference_id: string | null
          reference_label: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          customer_email?: string | null
          customer_name?: string | null
          description?: string | null
          environment: string
          id?: string
          kind?: string
          payment_status: string
          raw_event?: Json | null
          receipt_number: string
          reference_id?: string | null
          reference_label?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          description?: string | null
          environment?: string
          id?: string
          kind?: string
          payment_status?: string
          raw_event?: Json | null
          receipt_number?: string
          reference_id?: string | null
          reference_label?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      event_inscricoes: {
        Row: {
          clube: string | null
          created_at: string
          email: string | null
          environment: string
          event_id: string | null
          event_titulo: string
          id: string
          nome: string | null
          payment_status: string
          quantidade: number
          stripe_session_id: string
          telefone: string | null
          updated_at: string
          valor_cents: number
        }
        Insert: {
          clube?: string | null
          created_at?: string
          email?: string | null
          environment?: string
          event_id?: string | null
          event_titulo: string
          id?: string
          nome?: string | null
          payment_status?: string
          quantidade?: number
          stripe_session_id: string
          telefone?: string | null
          updated_at?: string
          valor_cents?: number
        }
        Update: {
          clube?: string | null
          created_at?: string
          email?: string | null
          environment?: string
          event_id?: string | null
          event_titulo?: string
          id?: string
          nome?: string | null
          payment_status?: string
          quantidade?: number
          stripe_session_id?: string
          telefone?: string | null
          updated_at?: string
          valor_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_inscricoes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          food_tips: string | null
          gallery_urls: string[]
          host_club: string | null
          id: string
          inscricao_ativa: boolean
          inscricao_valor_cents: number
          latitude: number | null
          location: string | null
          lodging_tips: string | null
          longitude: number | null
          organizer: string | null
          place_info: string | null
          starts_at: string | null
          tag: string | null
          title: string
          tourism_tips: string | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          food_tips?: string | null
          gallery_urls?: string[]
          host_club?: string | null
          id?: string
          inscricao_ativa?: boolean
          inscricao_valor_cents?: number
          latitude?: number | null
          location?: string | null
          lodging_tips?: string | null
          longitude?: number | null
          organizer?: string | null
          place_info?: string | null
          starts_at?: string | null
          tag?: string | null
          title: string
          tourism_tips?: string | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          food_tips?: string | null
          gallery_urls?: string[]
          host_club?: string | null
          id?: string
          inscricao_ativa?: boolean
          inscricao_valor_cents?: number
          latitude?: number | null
          location?: string | null
          lodging_tips?: string | null
          longitude?: number | null
          organizer?: string | null
          place_info?: string | null
          starts_at?: string | null
          tag?: string | null
          title?: string
          tourism_tips?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fin_categorias: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          id: string
          nome: string
          ordem: number
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_cobrancas: {
        Row: {
          club_id: string | null
          created_at: string
          criado_por: string | null
          descricao: string
          id: string
          observacoes: string | null
          referencia: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao: string
          id?: string
          observacoes?: string | null
          referencia?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string
          id?: string
          observacoes?: string | null
          referencia?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_cobrancas_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_cobrancas_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs_public"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_contas_bancarias: {
        Row: {
          agencia: string | null
          ativo: boolean
          banco: string
          conta: string | null
          created_at: string
          id: string
          nome: string
          saldo_inicial: number
          tipo: string
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean
          banco: string
          conta?: string | null
          created_at?: string
          id?: string
          nome: string
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativo?: boolean
          banco?: string
          conta?: string | null
          created_at?: string
          id?: string
          nome?: string
          saldo_inicial?: number
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_contas_pagar: {
        Row: {
          anexo_url: string | null
          aprovado_em: string | null
          aprovado_por: string | null
          categoria_id: string | null
          competencia: string | null
          conta_id: string | null
          created_at: string
          criado_por: string | null
          descricao: string
          documento: string | null
          fornecedor: string | null
          id: string
          observacoes: string | null
          pago_em: string | null
          parecer_governador: string | null
          solicitante_nome: string | null
          status: string
          status_aprovacao: string
          updated_at: string
          valor: number
          valor_pago: number | null
          vencimento: string
        }
        Insert: {
          anexo_url?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          categoria_id?: string | null
          competencia?: string | null
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao: string
          documento?: string | null
          fornecedor?: string | null
          id?: string
          observacoes?: string | null
          pago_em?: string | null
          parecer_governador?: string | null
          solicitante_nome?: string | null
          status?: string
          status_aprovacao?: string
          updated_at?: string
          valor?: number
          valor_pago?: number | null
          vencimento: string
        }
        Update: {
          anexo_url?: string | null
          aprovado_em?: string | null
          aprovado_por?: string | null
          categoria_id?: string | null
          competencia?: string | null
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string
          documento?: string | null
          fornecedor?: string | null
          id?: string
          observacoes?: string | null
          pago_em?: string | null
          parecer_governador?: string | null
          solicitante_nome?: string | null
          status?: string
          status_aprovacao?: string
          updated_at?: string
          valor?: number
          valor_pago?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_contas_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_contas_pagar_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "fin_contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_contas_receber: {
        Row: {
          anexo_url: string | null
          categoria_id: string | null
          competencia: string | null
          conta_id: string | null
          created_at: string
          criado_por: string | null
          descricao: string
          documento: string | null
          id: string
          observacoes: string | null
          pagador: string | null
          recebido_em: string | null
          status: string
          updated_at: string
          valor: number
          valor_recebido: number | null
          vencimento: string
        }
        Insert: {
          anexo_url?: string | null
          categoria_id?: string | null
          competencia?: string | null
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao: string
          documento?: string | null
          id?: string
          observacoes?: string | null
          pagador?: string | null
          recebido_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          valor_recebido?: number | null
          vencimento: string
        }
        Update: {
          anexo_url?: string | null
          categoria_id?: string | null
          competencia?: string | null
          conta_id?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string
          documento?: string | null
          id?: string
          observacoes?: string | null
          pagador?: string | null
          recebido_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          valor_recebido?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fin_contas_receber_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_contas_receber_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "fin_contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_historico_aprovacoes: {
        Row: {
          acao: string
          cargo_usuario: string | null
          conta_pagar_id: string | null
          created_at: string
          id: string
          parecer: string | null
          usuario_id: string | null
          usuario_nome: string | null
        }
        Insert: {
          acao: string
          cargo_usuario?: string | null
          conta_pagar_id?: string | null
          created_at?: string
          id?: string
          parecer?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Update: {
          acao?: string
          cargo_usuario?: string | null
          conta_pagar_id?: string | null
          created_at?: string
          id?: string
          parecer?: string | null
          usuario_id?: string | null
          usuario_nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_historico_aprovacoes_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "fin_contas_pagar"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_movimentacoes: {
        Row: {
          categoria_id: string | null
          conciliado: boolean
          conta_id: string
          created_at: string
          criado_por: string | null
          data: string
          descricao: string
          documento: string | null
          id: string
          observacoes: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          conciliado?: boolean
          conta_id: string
          created_at?: string
          criado_por?: string | null
          data: string
          descricao: string
          documento?: string | null
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria_id?: string | null
          conciliado?: boolean
          conta_id?: string
          created_at?: string
          criado_por?: string | null
          data?: string
          descricao?: string
          documento?: string | null
          id?: string
          observacoes?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fin_movimentacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_movimentacoes_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "fin_contas_bancarias"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_orcamento: {
        Row: {
          ano: number
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_orcamento_itens: {
        Row: {
          categoria_id: string | null
          created_at: string
          id: string
          observacoes: string | null
          orcamento_id: string
          valor_previsto: number
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          orcamento_id: string
          valor_previsto?: number
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          orcamento_id?: string
          valor_previsto?: number
        }
        Relationships: [
          {
            foreignKeyName: "fin_orcamento_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "fin_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "fin_orcamento"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders: {
        Row: {
          bio: string | null
          category: string
          created_at: string
          email: string | null
          gallery_urls: string[]
          id: string
          message: string | null
          motto: string | null
          name: string
          order_index: number
          phone: string | null
          photo_url: string | null
          pin_url: string | null
          role: string | null
          updated_at: string
          year_label: string | null
        }
        Insert: {
          bio?: string | null
          category: string
          created_at?: string
          email?: string | null
          gallery_urls?: string[]
          id?: string
          message?: string | null
          motto?: string | null
          name: string
          order_index?: number
          phone?: string | null
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string
          year_label?: string | null
        }
        Update: {
          bio?: string | null
          category?: string
          created_at?: string
          email?: string | null
          gallery_urls?: string[]
          id?: string
          message?: string | null
          motto?: string | null
          name?: string
          order_index?: number
          phone?: string | null
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string
          year_label?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string
          slug: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string
          slug?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      popups: {
        Row: {
          active: boolean
          content: string | null
          created_at: string
          display_seconds: number
          end_at: string
          id: string
          image_url: string | null
          link_label: string | null
          link_url: string | null
          start_at: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: string | null
          created_at?: string
          display_seconds?: number
          end_at: string
          id?: string
          image_url?: string | null
          link_label?: string | null
          link_url?: string | null
          start_at: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string | null
          created_at?: string
          display_seconds?: number
          end_at?: string
          id?: string
          image_url?: string | null
          link_label?: string | null
          link_url?: string | null
          start_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          gallery_urls: string[]
          id: string
          order_index: number
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          id?: string
          order_index?: number
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          gallery_urls?: string[]
          id?: string
          order_index?: number
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          letter: string
          name: string
          order_index: number
          president: string | null
          president_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          letter: string
          name: string
          order_index?: number
          president?: string | null
          president_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          letter?: string
          name?: string
          order_index?: number
          president?: string | null
          president_photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string | null
          id: string
          path: string
          visitor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          path?: string
          visitor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          path?: string
          visitor_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      clubs_public: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          division_id: string | null
          facebook: string | null
          id: string | null
          instagram: string | null
          logo_url: string | null
          meetings: string | null
          name: string | null
          order_index: number | null
          president: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          division_id?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name?: string | null
          order_index?: number | null
          president?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          division_id?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          logo_url?: string | null
          meetings?: string | null
          name?: string | null
          order_index?: number | null
          president?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clubs_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      leaders_public: {
        Row: {
          bio: string | null
          category: string | null
          created_at: string | null
          email: string | null
          gallery_urls: string[] | null
          id: string | null
          message: string | null
          motto: string | null
          name: string | null
          order_index: number | null
          phone: string | null
          photo_url: string | null
          pin_url: string | null
          role: string | null
          updated_at: string | null
          year_label: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          email?: never
          gallery_urls?: string[] | null
          id?: string | null
          message?: string | null
          motto?: string | null
          name?: string | null
          order_index?: number | null
          phone?: never
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string | null
          year_label?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          created_at?: string | null
          email?: never
          gallery_urls?: string[] | null
          id?: string | null
          message?: string | null
          motto?: string | null
          name?: string | null
          order_index?: number | null
          phone?: never
          photo_url?: string | null
          pin_url?: string | null
          role?: string | null
          updated_at?: string | null
          year_label?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_edit_content: { Args: { _user_id: string }; Returns: boolean }
      can_view_users: { Args: { _user_id: string }; Returns: boolean }
      has_panel_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "basico"
        | "intermediario"
        | "avancado"
        | "gestor_admin"
        | "gestor_financeiro"
        | "gestor_contabil"
        | "gestor_crm"
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
      app_role: [
        "admin",
        "user",
        "basico",
        "intermediario",
        "avancado",
        "gestor_admin",
        "gestor_financeiro",
        "gestor_contabil",
        "gestor_crm",
      ],
    },
  },
} as const
