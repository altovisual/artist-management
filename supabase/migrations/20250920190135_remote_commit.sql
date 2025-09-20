drop policy "Artists can manage their own assets." on "public"."assets";

drop policy "Allow all operations on distribution_accounts" on "public"."distribution_accounts";

drop policy "Public work participants are viewable by everyone." on "public"."work_participants";

revoke delete on table "public"."artists" from "anon";

revoke insert on table "public"."artists" from "anon";

revoke references on table "public"."artists" from "anon";

revoke select on table "public"."artists" from "anon";

revoke trigger on table "public"."artists" from "anon";

revoke truncate on table "public"."artists" from "anon";

revoke update on table "public"."artists" from "anon";

revoke delete on table "public"."artists" from "authenticated";

revoke insert on table "public"."artists" from "authenticated";

revoke references on table "public"."artists" from "authenticated";

revoke select on table "public"."artists" from "authenticated";

revoke trigger on table "public"."artists" from "authenticated";

revoke truncate on table "public"."artists" from "authenticated";

revoke update on table "public"."artists" from "authenticated";

revoke delete on table "public"."artists" from "service_role";

revoke insert on table "public"."artists" from "service_role";

revoke references on table "public"."artists" from "service_role";

revoke select on table "public"."artists" from "service_role";

revoke trigger on table "public"."artists" from "service_role";

revoke truncate on table "public"."artists" from "service_role";

revoke update on table "public"."artists" from "service_role";

revoke delete on table "public"."assets" from "anon";

revoke insert on table "public"."assets" from "anon";

revoke references on table "public"."assets" from "anon";

revoke select on table "public"."assets" from "anon";

revoke trigger on table "public"."assets" from "anon";

revoke truncate on table "public"."assets" from "anon";

revoke update on table "public"."assets" from "anon";

revoke delete on table "public"."assets" from "authenticated";

revoke insert on table "public"."assets" from "authenticated";

revoke references on table "public"."assets" from "authenticated";

revoke select on table "public"."assets" from "authenticated";

revoke trigger on table "public"."assets" from "authenticated";

revoke truncate on table "public"."assets" from "authenticated";

revoke update on table "public"."assets" from "authenticated";

revoke delete on table "public"."assets" from "service_role";

revoke insert on table "public"."assets" from "service_role";

revoke references on table "public"."assets" from "service_role";

revoke select on table "public"."assets" from "service_role";

revoke trigger on table "public"."assets" from "service_role";

revoke truncate on table "public"."assets" from "service_role";

revoke update on table "public"."assets" from "service_role";

revoke delete on table "public"."audience_reports" from "anon";

revoke insert on table "public"."audience_reports" from "anon";

revoke references on table "public"."audience_reports" from "anon";

revoke select on table "public"."audience_reports" from "anon";

revoke trigger on table "public"."audience_reports" from "anon";

revoke truncate on table "public"."audience_reports" from "anon";

revoke update on table "public"."audience_reports" from "anon";

revoke delete on table "public"."audience_reports" from "authenticated";

revoke insert on table "public"."audience_reports" from "authenticated";

revoke references on table "public"."audience_reports" from "authenticated";

revoke select on table "public"."audience_reports" from "authenticated";

revoke trigger on table "public"."audience_reports" from "authenticated";

revoke truncate on table "public"."audience_reports" from "authenticated";

revoke update on table "public"."audience_reports" from "authenticated";

revoke delete on table "public"."audience_reports" from "service_role";

revoke insert on table "public"."audience_reports" from "service_role";

revoke references on table "public"."audience_reports" from "service_role";

revoke select on table "public"."audience_reports" from "service_role";

revoke trigger on table "public"."audience_reports" from "service_role";

revoke truncate on table "public"."audience_reports" from "service_role";

revoke update on table "public"."audience_reports" from "service_role";

revoke delete on table "public"."contract_participants" from "anon";

revoke insert on table "public"."contract_participants" from "anon";

revoke references on table "public"."contract_participants" from "anon";

revoke select on table "public"."contract_participants" from "anon";

revoke trigger on table "public"."contract_participants" from "anon";

revoke truncate on table "public"."contract_participants" from "anon";

revoke update on table "public"."contract_participants" from "anon";

revoke delete on table "public"."contract_participants" from "authenticated";

revoke insert on table "public"."contract_participants" from "authenticated";

revoke references on table "public"."contract_participants" from "authenticated";

revoke select on table "public"."contract_participants" from "authenticated";

revoke trigger on table "public"."contract_participants" from "authenticated";

revoke truncate on table "public"."contract_participants" from "authenticated";

revoke update on table "public"."contract_participants" from "authenticated";

revoke delete on table "public"."contract_participants" from "service_role";

revoke insert on table "public"."contract_participants" from "service_role";

revoke references on table "public"."contract_participants" from "service_role";

revoke select on table "public"."contract_participants" from "service_role";

revoke trigger on table "public"."contract_participants" from "service_role";

revoke truncate on table "public"."contract_participants" from "service_role";

revoke update on table "public"."contract_participants" from "service_role";

revoke delete on table "public"."contracts" from "anon";

revoke insert on table "public"."contracts" from "anon";

revoke references on table "public"."contracts" from "anon";

revoke select on table "public"."contracts" from "anon";

revoke trigger on table "public"."contracts" from "anon";

revoke truncate on table "public"."contracts" from "anon";

revoke update on table "public"."contracts" from "anon";

revoke delete on table "public"."contracts" from "authenticated";

revoke insert on table "public"."contracts" from "authenticated";

revoke references on table "public"."contracts" from "authenticated";

revoke select on table "public"."contracts" from "authenticated";

revoke trigger on table "public"."contracts" from "authenticated";

revoke truncate on table "public"."contracts" from "authenticated";

revoke update on table "public"."contracts" from "authenticated";

revoke delete on table "public"."contracts" from "service_role";

revoke insert on table "public"."contracts" from "service_role";

revoke references on table "public"."contracts" from "service_role";

revoke select on table "public"."contracts" from "service_role";

revoke trigger on table "public"."contracts" from "service_role";

revoke truncate on table "public"."contracts" from "service_role";

revoke update on table "public"."contracts" from "service_role";

revoke delete on table "public"."creative_vault_items" from "anon";

revoke insert on table "public"."creative_vault_items" from "anon";

revoke references on table "public"."creative_vault_items" from "anon";

revoke select on table "public"."creative_vault_items" from "anon";

revoke trigger on table "public"."creative_vault_items" from "anon";

revoke truncate on table "public"."creative_vault_items" from "anon";

revoke update on table "public"."creative_vault_items" from "anon";

revoke delete on table "public"."creative_vault_items" from "authenticated";

revoke insert on table "public"."creative_vault_items" from "authenticated";

revoke references on table "public"."creative_vault_items" from "authenticated";

revoke select on table "public"."creative_vault_items" from "authenticated";

revoke trigger on table "public"."creative_vault_items" from "authenticated";

revoke truncate on table "public"."creative_vault_items" from "authenticated";

revoke update on table "public"."creative_vault_items" from "authenticated";

revoke delete on table "public"."creative_vault_items" from "service_role";

revoke insert on table "public"."creative_vault_items" from "service_role";

revoke references on table "public"."creative_vault_items" from "service_role";

revoke select on table "public"."creative_vault_items" from "service_role";

revoke trigger on table "public"."creative_vault_items" from "service_role";

revoke truncate on table "public"."creative_vault_items" from "service_role";

revoke update on table "public"."creative_vault_items" from "service_role";

revoke delete on table "public"."distribution_accounts" from "anon";

revoke insert on table "public"."distribution_accounts" from "anon";

revoke references on table "public"."distribution_accounts" from "anon";

revoke select on table "public"."distribution_accounts" from "anon";

revoke trigger on table "public"."distribution_accounts" from "anon";

revoke truncate on table "public"."distribution_accounts" from "anon";

revoke update on table "public"."distribution_accounts" from "anon";

revoke delete on table "public"."distribution_accounts" from "authenticated";

revoke insert on table "public"."distribution_accounts" from "authenticated";

revoke references on table "public"."distribution_accounts" from "authenticated";

revoke select on table "public"."distribution_accounts" from "authenticated";

revoke trigger on table "public"."distribution_accounts" from "authenticated";

revoke truncate on table "public"."distribution_accounts" from "authenticated";

revoke update on table "public"."distribution_accounts" from "authenticated";

revoke delete on table "public"."distribution_accounts" from "service_role";

revoke insert on table "public"."distribution_accounts" from "service_role";

revoke references on table "public"."distribution_accounts" from "service_role";

revoke select on table "public"."distribution_accounts" from "service_role";

revoke trigger on table "public"."distribution_accounts" from "service_role";

revoke truncate on table "public"."distribution_accounts" from "service_role";

revoke update on table "public"."distribution_accounts" from "service_role";

revoke delete on table "public"."events" from "anon";

revoke insert on table "public"."events" from "anon";

revoke references on table "public"."events" from "anon";

revoke select on table "public"."events" from "anon";

revoke trigger on table "public"."events" from "anon";

revoke truncate on table "public"."events" from "anon";

revoke update on table "public"."events" from "anon";

revoke delete on table "public"."events" from "authenticated";

revoke insert on table "public"."events" from "authenticated";

revoke references on table "public"."events" from "authenticated";

revoke select on table "public"."events" from "authenticated";

revoke trigger on table "public"."events" from "authenticated";

revoke truncate on table "public"."events" from "authenticated";

revoke update on table "public"."events" from "authenticated";

revoke delete on table "public"."events" from "service_role";

revoke insert on table "public"."events" from "service_role";

revoke references on table "public"."events" from "service_role";

revoke select on table "public"."events" from "service_role";

revoke trigger on table "public"."events" from "service_role";

revoke truncate on table "public"."events" from "service_role";

revoke update on table "public"."events" from "service_role";

revoke delete on table "public"."muso_ai_profiles" from "anon";

revoke insert on table "public"."muso_ai_profiles" from "anon";

revoke references on table "public"."muso_ai_profiles" from "anon";

revoke select on table "public"."muso_ai_profiles" from "anon";

revoke trigger on table "public"."muso_ai_profiles" from "anon";

revoke truncate on table "public"."muso_ai_profiles" from "anon";

revoke update on table "public"."muso_ai_profiles" from "anon";

revoke delete on table "public"."muso_ai_profiles" from "authenticated";

revoke insert on table "public"."muso_ai_profiles" from "authenticated";

revoke references on table "public"."muso_ai_profiles" from "authenticated";

revoke select on table "public"."muso_ai_profiles" from "authenticated";

revoke trigger on table "public"."muso_ai_profiles" from "authenticated";

revoke truncate on table "public"."muso_ai_profiles" from "authenticated";

revoke update on table "public"."muso_ai_profiles" from "authenticated";

revoke delete on table "public"."muso_ai_profiles" from "service_role";

revoke insert on table "public"."muso_ai_profiles" from "service_role";

revoke references on table "public"."muso_ai_profiles" from "service_role";

revoke select on table "public"."muso_ai_profiles" from "service_role";

revoke trigger on table "public"."muso_ai_profiles" from "service_role";

revoke truncate on table "public"."muso_ai_profiles" from "service_role";

revoke update on table "public"."muso_ai_profiles" from "service_role";

revoke delete on table "public"."oauth_state" from "anon";

revoke insert on table "public"."oauth_state" from "anon";

revoke references on table "public"."oauth_state" from "anon";

revoke select on table "public"."oauth_state" from "anon";

revoke trigger on table "public"."oauth_state" from "anon";

revoke truncate on table "public"."oauth_state" from "anon";

revoke update on table "public"."oauth_state" from "anon";

revoke delete on table "public"."oauth_state" from "authenticated";

revoke insert on table "public"."oauth_state" from "authenticated";

revoke references on table "public"."oauth_state" from "authenticated";

revoke select on table "public"."oauth_state" from "authenticated";

revoke trigger on table "public"."oauth_state" from "authenticated";

revoke truncate on table "public"."oauth_state" from "authenticated";

revoke update on table "public"."oauth_state" from "authenticated";

revoke delete on table "public"."oauth_state" from "service_role";

revoke insert on table "public"."oauth_state" from "service_role";

revoke references on table "public"."oauth_state" from "service_role";

revoke select on table "public"."oauth_state" from "service_role";

revoke trigger on table "public"."oauth_state" from "service_role";

revoke truncate on table "public"."oauth_state" from "service_role";

revoke update on table "public"."oauth_state" from "service_role";

revoke delete on table "public"."participants" from "anon";

revoke insert on table "public"."participants" from "anon";

revoke references on table "public"."participants" from "anon";

revoke select on table "public"."participants" from "anon";

revoke trigger on table "public"."participants" from "anon";

revoke truncate on table "public"."participants" from "anon";

revoke update on table "public"."participants" from "anon";

revoke delete on table "public"."participants" from "authenticated";

revoke insert on table "public"."participants" from "authenticated";

revoke references on table "public"."participants" from "authenticated";

revoke select on table "public"."participants" from "authenticated";

revoke trigger on table "public"."participants" from "authenticated";

revoke truncate on table "public"."participants" from "authenticated";

revoke update on table "public"."participants" from "authenticated";

revoke delete on table "public"."participants" from "service_role";

revoke insert on table "public"."participants" from "service_role";

revoke references on table "public"."participants" from "service_role";

revoke select on table "public"."participants" from "service_role";

revoke trigger on table "public"."participants" from "service_role";

revoke truncate on table "public"."participants" from "service_role";

revoke update on table "public"."participants" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

revoke delete on table "public"."royalties" from "anon";

revoke insert on table "public"."royalties" from "anon";

revoke references on table "public"."royalties" from "anon";

revoke select on table "public"."royalties" from "anon";

revoke trigger on table "public"."royalties" from "anon";

revoke truncate on table "public"."royalties" from "anon";

revoke update on table "public"."royalties" from "anon";

revoke delete on table "public"."royalties" from "authenticated";

revoke insert on table "public"."royalties" from "authenticated";

revoke references on table "public"."royalties" from "authenticated";

revoke select on table "public"."royalties" from "authenticated";

revoke trigger on table "public"."royalties" from "authenticated";

revoke truncate on table "public"."royalties" from "authenticated";

revoke update on table "public"."royalties" from "authenticated";

revoke delete on table "public"."royalties" from "service_role";

revoke insert on table "public"."royalties" from "service_role";

revoke references on table "public"."royalties" from "service_role";

revoke select on table "public"."royalties" from "service_role";

revoke trigger on table "public"."royalties" from "service_role";

revoke truncate on table "public"."royalties" from "service_role";

revoke update on table "public"."royalties" from "service_role";

revoke delete on table "public"."royalty_reports" from "anon";

revoke insert on table "public"."royalty_reports" from "anon";

revoke references on table "public"."royalty_reports" from "anon";

revoke select on table "public"."royalty_reports" from "anon";

revoke trigger on table "public"."royalty_reports" from "anon";

revoke truncate on table "public"."royalty_reports" from "anon";

revoke update on table "public"."royalty_reports" from "anon";

revoke delete on table "public"."royalty_reports" from "authenticated";

revoke insert on table "public"."royalty_reports" from "authenticated";

revoke references on table "public"."royalty_reports" from "authenticated";

revoke select on table "public"."royalty_reports" from "authenticated";

revoke trigger on table "public"."royalty_reports" from "authenticated";

revoke truncate on table "public"."royalty_reports" from "authenticated";

revoke update on table "public"."royalty_reports" from "authenticated";

revoke delete on table "public"."royalty_reports" from "service_role";

revoke insert on table "public"."royalty_reports" from "service_role";

revoke references on table "public"."royalty_reports" from "service_role";

revoke select on table "public"."royalty_reports" from "service_role";

revoke trigger on table "public"."royalty_reports" from "service_role";

revoke truncate on table "public"."royalty_reports" from "service_role";

revoke update on table "public"."royalty_reports" from "service_role";

revoke delete on table "public"."signatures" from "anon";

revoke insert on table "public"."signatures" from "anon";

revoke references on table "public"."signatures" from "anon";

revoke select on table "public"."signatures" from "anon";

revoke trigger on table "public"."signatures" from "anon";

revoke truncate on table "public"."signatures" from "anon";

revoke update on table "public"."signatures" from "anon";

revoke delete on table "public"."signatures" from "authenticated";

revoke insert on table "public"."signatures" from "authenticated";

revoke references on table "public"."signatures" from "authenticated";

revoke select on table "public"."signatures" from "authenticated";

revoke trigger on table "public"."signatures" from "authenticated";

revoke truncate on table "public"."signatures" from "authenticated";

revoke update on table "public"."signatures" from "authenticated";

revoke delete on table "public"."signatures" from "service_role";

revoke insert on table "public"."signatures" from "service_role";

revoke references on table "public"."signatures" from "service_role";

revoke select on table "public"."signatures" from "service_role";

revoke trigger on table "public"."signatures" from "service_role";

revoke truncate on table "public"."signatures" from "service_role";

revoke update on table "public"."signatures" from "service_role";

revoke delete on table "public"."social_accounts" from "anon";

revoke insert on table "public"."social_accounts" from "anon";

revoke references on table "public"."social_accounts" from "anon";

revoke select on table "public"."social_accounts" from "anon";

revoke trigger on table "public"."social_accounts" from "anon";

revoke truncate on table "public"."social_accounts" from "anon";

revoke update on table "public"."social_accounts" from "anon";

revoke delete on table "public"."social_accounts" from "authenticated";

revoke insert on table "public"."social_accounts" from "authenticated";

revoke references on table "public"."social_accounts" from "authenticated";

revoke select on table "public"."social_accounts" from "authenticated";

revoke trigger on table "public"."social_accounts" from "authenticated";

revoke truncate on table "public"."social_accounts" from "authenticated";

revoke update on table "public"."social_accounts" from "authenticated";

revoke delete on table "public"."social_accounts" from "service_role";

revoke insert on table "public"."social_accounts" from "service_role";

revoke references on table "public"."social_accounts" from "service_role";

revoke select on table "public"."social_accounts" from "service_role";

revoke trigger on table "public"."social_accounts" from "service_role";

revoke truncate on table "public"."social_accounts" from "service_role";

revoke update on table "public"."social_accounts" from "service_role";

revoke delete on table "public"."streaming_analytics" from "anon";

revoke insert on table "public"."streaming_analytics" from "anon";

revoke references on table "public"."streaming_analytics" from "anon";

revoke select on table "public"."streaming_analytics" from "anon";

revoke trigger on table "public"."streaming_analytics" from "anon";

revoke truncate on table "public"."streaming_analytics" from "anon";

revoke update on table "public"."streaming_analytics" from "anon";

revoke delete on table "public"."streaming_analytics" from "authenticated";

revoke insert on table "public"."streaming_analytics" from "authenticated";

revoke references on table "public"."streaming_analytics" from "authenticated";

revoke select on table "public"."streaming_analytics" from "authenticated";

revoke trigger on table "public"."streaming_analytics" from "authenticated";

revoke truncate on table "public"."streaming_analytics" from "authenticated";

revoke update on table "public"."streaming_analytics" from "authenticated";

revoke delete on table "public"."streaming_analytics" from "service_role";

revoke insert on table "public"."streaming_analytics" from "service_role";

revoke references on table "public"."streaming_analytics" from "service_role";

revoke select on table "public"."streaming_analytics" from "service_role";

revoke trigger on table "public"."streaming_analytics" from "service_role";

revoke truncate on table "public"."streaming_analytics" from "service_role";

revoke update on table "public"."streaming_analytics" from "service_role";

revoke delete on table "public"."templates" from "anon";

revoke insert on table "public"."templates" from "anon";

revoke references on table "public"."templates" from "anon";

revoke select on table "public"."templates" from "anon";

revoke trigger on table "public"."templates" from "anon";

revoke truncate on table "public"."templates" from "anon";

revoke update on table "public"."templates" from "anon";

revoke delete on table "public"."templates" from "authenticated";

revoke insert on table "public"."templates" from "authenticated";

revoke references on table "public"."templates" from "authenticated";

revoke select on table "public"."templates" from "authenticated";

revoke trigger on table "public"."templates" from "authenticated";

revoke truncate on table "public"."templates" from "authenticated";

revoke update on table "public"."templates" from "authenticated";

revoke delete on table "public"."templates" from "service_role";

revoke insert on table "public"."templates" from "service_role";

revoke references on table "public"."templates" from "service_role";

revoke select on table "public"."templates" from "service_role";

revoke trigger on table "public"."templates" from "service_role";

revoke truncate on table "public"."templates" from "service_role";

revoke update on table "public"."templates" from "service_role";

revoke delete on table "public"."transaction_categories" from "anon";

revoke insert on table "public"."transaction_categories" from "anon";

revoke references on table "public"."transaction_categories" from "anon";

revoke select on table "public"."transaction_categories" from "anon";

revoke trigger on table "public"."transaction_categories" from "anon";

revoke truncate on table "public"."transaction_categories" from "anon";

revoke update on table "public"."transaction_categories" from "anon";

revoke delete on table "public"."transaction_categories" from "authenticated";

revoke insert on table "public"."transaction_categories" from "authenticated";

revoke references on table "public"."transaction_categories" from "authenticated";

revoke select on table "public"."transaction_categories" from "authenticated";

revoke trigger on table "public"."transaction_categories" from "authenticated";

revoke truncate on table "public"."transaction_categories" from "authenticated";

revoke update on table "public"."transaction_categories" from "authenticated";

revoke delete on table "public"."transaction_categories" from "service_role";

revoke insert on table "public"."transaction_categories" from "service_role";

revoke references on table "public"."transaction_categories" from "service_role";

revoke select on table "public"."transaction_categories" from "service_role";

revoke trigger on table "public"."transaction_categories" from "service_role";

revoke truncate on table "public"."transaction_categories" from "service_role";

revoke update on table "public"."transaction_categories" from "service_role";

revoke delete on table "public"."transactions" from "anon";

revoke insert on table "public"."transactions" from "anon";

revoke references on table "public"."transactions" from "anon";

revoke select on table "public"."transactions" from "anon";

revoke trigger on table "public"."transactions" from "anon";

revoke truncate on table "public"."transactions" from "anon";

revoke update on table "public"."transactions" from "anon";

revoke delete on table "public"."transactions" from "authenticated";

revoke insert on table "public"."transactions" from "authenticated";

revoke references on table "public"."transactions" from "authenticated";

revoke select on table "public"."transactions" from "authenticated";

revoke trigger on table "public"."transactions" from "authenticated";

revoke truncate on table "public"."transactions" from "authenticated";

revoke update on table "public"."transactions" from "authenticated";

revoke delete on table "public"."transactions" from "service_role";

revoke insert on table "public"."transactions" from "service_role";

revoke references on table "public"."transactions" from "service_role";

revoke select on table "public"."transactions" from "service_role";

revoke trigger on table "public"."transactions" from "service_role";

revoke truncate on table "public"."transactions" from "service_role";

revoke update on table "public"."transactions" from "service_role";

revoke delete on table "public"."work_participants" from "anon";

revoke insert on table "public"."work_participants" from "anon";

revoke references on table "public"."work_participants" from "anon";

revoke select on table "public"."work_participants" from "anon";

revoke trigger on table "public"."work_participants" from "anon";

revoke truncate on table "public"."work_participants" from "anon";

revoke update on table "public"."work_participants" from "anon";

revoke delete on table "public"."work_participants" from "authenticated";

revoke insert on table "public"."work_participants" from "authenticated";

revoke references on table "public"."work_participants" from "authenticated";

revoke select on table "public"."work_participants" from "authenticated";

revoke trigger on table "public"."work_participants" from "authenticated";

revoke truncate on table "public"."work_participants" from "authenticated";

revoke update on table "public"."work_participants" from "authenticated";

revoke delete on table "public"."work_participants" from "service_role";

revoke insert on table "public"."work_participants" from "service_role";

revoke references on table "public"."work_participants" from "service_role";

revoke select on table "public"."work_participants" from "service_role";

revoke trigger on table "public"."work_participants" from "service_role";

revoke truncate on table "public"."work_participants" from "service_role";

revoke update on table "public"."work_participants" from "service_role";

alter table "public"."distribution_accounts" drop constraint "distribution_accounts_analytics_status_check";

alter table "public"."distribution_accounts" drop constraint "distribution_accounts_created_by_fkey";

alter table "public"."royalty_reports" drop constraint "royalty_reports_artist_id_fkey";

alter table "public"."social_accounts" drop constraint "social_accounts_created_by_fkey";

alter table "public"."streaming_analytics" drop constraint "streaming_analytics_account_id_fkey";

alter table "public"."streaming_analytics" drop constraint "streaming_analytics_artist_id_fkey";

alter table "public"."streaming_analytics" drop constraint "unique_daily_analytic";

alter table "public"."projects" drop constraint "projects_artist_id_fkey";

drop function if exists "public"."get_all_participants"();

drop function if exists "public"."handle_royalty_report_upload"();

alter table "public"."streaming_analytics" drop constraint "streaming_analytics_pkey";

drop index if exists "public"."streaming_analytics_pkey";

drop index if exists "public"."unique_daily_analytic";

drop index if exists "public"."oauth_state_pkey";

drop table "public"."streaming_analytics";

alter table "public"."audience_reports" enable row level security;

alter table "public"."distribution_accounts" alter column "analytics_status" drop not null;

alter table "public"."distribution_accounts" alter column "created_by" set default auth.uid();

alter table "public"."distribution_accounts" alter column "distributor" drop default;

alter table "public"."distribution_accounts" alter column "service" set not null;

alter table "public"."distribution_accounts" alter column "updated_at" set default now();

alter table "public"."oauth_state" add column "distribution_account_id" uuid;

alter table "public"."oauth_state" alter column "state" set data type text using "state"::text;

alter table "public"."oauth_state" alter column "user_id" drop not null;

alter table "public"."royalty_reports" drop column "artist_id";

alter table "public"."social_accounts" alter column "created_by" set default auth.uid();

alter table "public"."social_accounts" alter column "updated_at" set default now();

CREATE INDEX idx_distribution_accounts_artist_id ON public.distribution_accounts USING btree (artist_id);

CREATE INDEX idx_distribution_accounts_service ON public.distribution_accounts USING btree (service);

CREATE INDEX idx_projects_artist_id ON public.projects USING btree (artist_id);

CREATE INDEX idx_projects_release_date ON public.projects USING btree (release_date);

CREATE INDEX idx_projects_status ON public.projects USING btree (status);

CREATE INDEX idx_social_accounts_artist_id ON public.social_accounts USING btree (artist_id);

CREATE INDEX oauth_state_created_at_idx ON public.oauth_state USING btree (created_at);

CREATE UNIQUE INDEX unique_project_name ON public.projects USING btree (name);

CREATE UNIQUE INDEX ux_distribution_accounts_nonnull ON public.distribution_accounts USING btree (artist_id, service, account_id) WHERE (account_id IS NOT NULL);

CREATE UNIQUE INDEX ux_distribution_accounts_null ON public.distribution_accounts USING btree (artist_id, service) WHERE (account_id IS NULL);

CREATE UNIQUE INDEX oauth_state_pkey ON public.oauth_state USING btree (state);

alter table "public"."oauth_state" add constraint "oauth_state_distribution_account_id_fkey" FOREIGN KEY (distribution_account_id) REFERENCES distribution_accounts(id) ON DELETE CASCADE not valid;

alter table "public"."oauth_state" validate constraint "oauth_state_distribution_account_id_fkey";

alter table "public"."projects" add constraint "unique_project_name" UNIQUE using index "unique_project_name";

alter table "public"."projects" add constraint "projects_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_artist_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_db_size_mb()
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
     DECLARE
         db_size_mb numeric;
     BEGIN
         SELECT sum(pg_database_size(pg_database.datname)) / (1024 * 1024) INTO db_size_mb
      FROM pg_database;
         RETURN db_size_mb;
    END;
    $function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_asset_artist_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    SELECT artist_id INTO NEW.artist_id
    FROM public.projects
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end$function$
;

CREATE OR REPLACE FUNCTION public.get_all_artists_for_admin()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Ensure only admins can run this function
    IF get_my_role() <> 'admin' THEN
        RAISE EXCEPTION 'Only admins can call this function.';
    END IF;

    RETURN (
        SELECT json_agg(artist_data)
        FROM (
            SELECT
                a.id,
                a.created_at,
                a.name,
                a.genre,
                a.country,
                a.profile_image,
                a.bio,
                a.monthly_listeners,
                a.total_streams,
                a.user_id,
                (SELECT json_agg(sa.*) FROM social_accounts sa WHERE sa.artist_id = a.id) as social_accounts,
                (SELECT json_agg(da.*) FROM distribution_accounts da WHERE da.artist_id = a.id) as distribution_accounts,
                (
                    SELECT json_agg(p_assets)
                    FROM (
                        SELECT 
                            p.name, 
                            p.release_date,
                            (SELECT json_agg(assets.*) FROM assets WHERE assets.project_id = p.id) as assets
                        FROM projects p
                        WHERE p.artist_id = a.id
                    ) p_assets
                ) as projects
            FROM
                artists a
        ) artist_data
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_users()
 RETURNS TABLE(id uuid, email text, role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- This function should only be callable by authenticated admins.
  IF get_my_role() <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can call this function.';
  END IF;

  RETURN QUERY
    SELECT u.id, u.email::text, (u.raw_app_meta_data ->> 'role')::text AS role
    FROM auth.users u;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_users_for_app()
 RETURNS TABLE(id uuid, email text, raw_user_meta_data jsonb)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT id, email, raw_user_meta_data FROM auth.users;
$function$
;

CREATE OR REPLACE FUNCTION public.get_contracts_with_details(is_admin boolean, user_id_param uuid)
 RETURNS TABLE(id uuid, work_id uuid, template_id integer, status text, created_at timestamp with time zone, updated_at timestamp with time zone, work_name text, template_type text, template_version text, participants json)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.work_id,
    c.template_id,
    c.status,
    c.created_at,
    c.updated_at,
    w.name as work_name,
    t.type as template_type,
    t.version as template_version,
    json_agg(json_build_object('id', p.id, 'name', p.name, 'role', cp.role)) as participants
  FROM public.contracts c
  LEFT JOIN public.projects w ON c.work_id = w.id
  LEFT JOIN public.templates t ON c.template_id = t.id
  LEFT JOIN public.contract_participants cp ON c.id = cp.contract_id
  LEFT JOIN public.participants p ON cp.participant_id = p.id
  WHERE is_admin OR c.id IN (
    SELECT contract_id FROM public.contract_participants WHERE participant_id IN (
      SELECT id FROM public.participants WHERE user_id = user_id_param
    )
  )
  GROUP BY c.id, w.name, t.type, t.version;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')::text;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_asset_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin'
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;


  create policy "Artists can create their own profile."
  on "public"."artists"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Artists can delete their own profile."
  on "public"."artists"
  as permissive
  for delete
  to authenticated
using ((auth.uid() = user_id));



  create policy "Artists can update their own profile."
  on "public"."artists"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Artists can view their own profile."
  on "public"."artists"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "dist_delete_own"
  on "public"."distribution_accounts"
  as permissive
  for delete
  to public
using ((created_by = auth.uid()));



  create policy "dist_insert_own"
  on "public"."distribution_accounts"
  as permissive
  for insert
  to public
with check ((created_by = auth.uid()));



  create policy "dist_select_authenticated"
  on "public"."distribution_accounts"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "dist_update_own"
  on "public"."distribution_accounts"
  as permissive
  for update
  to public
using ((created_by = auth.uid()))
with check ((created_by = auth.uid()));



  create policy "Admins can manage all muso_ai_profiles"
  on "public"."muso_ai_profiles"
  as permissive
  for all
  to public
using ((auth.role() = 'admin'::text));



  create policy "Enable delete for authenticated users"
  on "public"."muso_ai_profiles"
  as permissive
  for delete
  to public
using ((auth.uid() = ( SELECT artists.user_id
   FROM artists
  WHERE (artists.id = muso_ai_profiles.artist_id))));



  create policy "Enable insert for authenticated users"
  on "public"."muso_ai_profiles"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Enable read access for all users"
  on "public"."muso_ai_profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update for authenticated users"
  on "public"."muso_ai_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = ( SELECT artists.user_id
   FROM artists
  WHERE (artists.id = muso_ai_profiles.artist_id))))
with check ((auth.uid() = ( SELECT artists.user_id
   FROM artists
  WHERE (artists.id = muso_ai_profiles.artist_id))));



  create policy "Users can create their own projects."
  on "public"."projects"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Allow read access to all users"
  on "public"."signatures"
  as permissive
  for select
  to public
using (true);



  create policy "social_delete_own"
  on "public"."social_accounts"
  as permissive
  for delete
  to public
using ((created_by = auth.uid()));



  create policy "social_insert_own"
  on "public"."social_accounts"
  as permissive
  for insert
  to public
with check ((created_by = auth.uid()));



  create policy "social_select_authenticated"
  on "public"."social_accounts"
  as permissive
  for select
  to public
using ((auth.uid() IS NOT NULL));



  create policy "social_update_own"
  on "public"."social_accounts"
  as permissive
  for update
  to public
using ((created_by = auth.uid()))
with check ((created_by = auth.uid()));



  create policy "Los participantes de las obras son visibles por todos."
  on "public"."work_participants"
  as permissive
  for select
  to public
using (true);



  create policy "Los usuarios autenticados pueden añadir participantes a las ob"
  on "public"."work_participants"
  as permissive
  for insert
  to authenticated
with check (true);


CREATE TRIGGER trg_distribution_accounts_updated BEFORE UPDATE ON public.distribution_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_social_accounts_updated BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();


