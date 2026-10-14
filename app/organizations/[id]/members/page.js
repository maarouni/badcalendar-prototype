"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PageTemplate from "../../../components/PageTemplate";
import OrgSubNav from "../../../components/OrgSubNav";
import { HostAvatar } from "../../../components/EventVisuals";
import { fetchOrgs, readMembership, rosterVisible, ROSTER_GROUPS } from "../../../lib/organizations";

const SORTS = [
  { id: "name", label: "Alphabetically by name" },
  { id: "title", label: "By title" },
  { id: "city", label: "By city" },
];

// Cesar's "Organization Members" page (Figma, Oct 14): Leadership, Staff and
// Members as mini-cards, with search and sort.
export default function OrgMembers() {
  const { id } = useParams();
  const [o, setO] = useState(undefined);
  const [status, setStatus] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    fetchOrgs().then((list) => setO(list.find((x) => x.id === id) || null));
    setStatus(readMembership()[id] || "");
    try { setLoggedIn(!!localStorage.getItem("mc_user_v1")); } catch {}
  }, [id]);

  const roster = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = (o?.roster || []).filter((p) =>
      !needle || `${p.name} ${p.title} ${p.org} ${p.city}`.toLowerCase().includes(needle));
    return [...list].sort((a, b) => String(a[sort] || "").localeCompare(String(b[sort] || "")));
  }, [o, q, sort]);

  if (o === undefined) return <div className="tpl"><p>Loading…</p></div>;
  if (o === null) return <div className="tpl"><div className="empty-state">Couldn&rsquo;t find that organization. <a href="/organizations">Back to Organizations</a></div></div>;

  const visible = rosterVisible(o, status, loggedIn);

  return (
    <PageTemplate
      section="organizations"
      title="Organization Members"
      subtitle={o.name}
      legend={false}
      subnav={<OrgSubNav active="details" orgId={o.id} />}
      actions={<a href={`/organizations/${o.id}`} className="tpl-action">← Organization Details</a>}
    >
      {!visible ? (
        <div className="empty-state">
          {o.memberList === "members" ? "This member list is visible to members only. Set your status to Member on the Organization Details page." :
            o.memberList === "registered" ? <>This member list is visible to registered users. <a href="/login">Sign Up / Log In</a></> :
              "This organization keeps its member list private."}
        </div>
      ) : (
        <>
          <div className="org-roster-tools">
            <label className="table-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search individuals..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search individuals" />
            </label>
            <label className="org-sort">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {ROSTER_GROUPS.map((g) => {
            const people = roster.filter((p) => p.role === g.id);
            return (
              <section key={g.id} className="org-roster-group">
                <h4 className="org-roster-head">{g.label} <span className="nt-hint">({people.length})</span></h4>
                {people.length === 0 ? (
                  <p className="nt-hint">No one listed yet.</p>
                ) : (
                  <div className="org-minicards">
                    {people.map((p, i) => (
                      <div key={`${g.id}-${i}`} className="org-minicard">
                        <HostAvatar name={`${p.name} ${i}`} size={40} />
                        <div>
                          <div className="org-minicard-name">{p.name}{p.title ? `, ${p.title}` : ""}</div>
                          {p.org && <div className="nt-hint">{p.org}</div>}
                          {p.city && <div className="nt-hint">{p.city}</div>}
                          {p.email && <a href={`mailto:${p.email}`} className="nt-hint">{p.email}</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </PageTemplate>
  );
}
