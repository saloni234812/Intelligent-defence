// Playbook model for Supabase
const playbookSchema = {
  id: 'uuid primary key default gen_random_uuid()',
  name: 'text not null',
  description: 'text',
  priority: 'text not null check (priority in (\'CRITICAL\',\'HIGH\',\'MEDIUM\',\'LOW\'))',
  status: 'text not null default \'AVAILABLE\' check (status in (\'AVAILABLE\',\'IN_PROGRESS\',\'COMPLETED\',\'FAILED\',\'CANCELLED\'))',
  eta_seconds: 'integer default 0',
  category: 'text default \'TACTICAL\'',
  parameters: 'jsonb default \'{}\'::jsonb',
  created_by: 'uuid references users_app(id)',
  created_at: 'timestamptz default now()',
  updated_at: 'timestamptz default now()',
  executed_at: 'timestamptz',
  completed_at: 'timestamptz'
};

module.exports = playbookSchema;

