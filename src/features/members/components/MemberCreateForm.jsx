import { useState } from "react";
import * as Label from "@radix-ui/react-label";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { FormField } from "../../../shared/ui/FormField";
import { PasswordField } from "../../../shared/ui/PasswordField";
import { RoleSelect } from "../../../shared/ui/RoleSelect";

import { Roles } from "../../../shared/auth/authEnums";
import { memberRoleOptions } from "../../../shared/utils/constants";

const initialMember = {
  name: "",
  email: "",
  password: "",
  role: Roles.DEVELOPER,
};

export function MemberCreateForm({ canManageMembers, isSubmitting, onCreate }) {
  const [form, setForm] = useState(initialMember);
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    await onCreate(form);
    setForm(initialMember);
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField
        label="Name"
        value={form.name}
        onChange={update("name")}
        placeholder="Developer name"
        required
        disabled={!canManageMembers}
      />
      <FormField
        label="Email"
        type="email"
        value={form.email}
        onChange={update("email")}
        placeholder="dev@company.com"
        required
        disabled={!canManageMembers}
      />
      <PasswordField
        label="Password"
        value={form.password}
        onChange={update("password")}
        placeholder="Temporary password"
        required
        disabled={!canManageMembers}
      />
      <div className="field">
        <Label.Root className="label">Role</Label.Root>
        <RoleSelect
          value={form.role}
          options={memberRoleOptions}
          disabled={!canManageMembers}
          onValueChange={(role) => setForm((current) => ({ ...current, role }))}
        />
      </div>
      <button
        className="primary-button"
        type="submit"
        disabled={!canManageMembers || isSubmitting}
      >
        {isSubmitting ? <FiRefreshCw className="spin" /> : <FiPlus />}
        Create member
      </button>
    </form>
  );
}
