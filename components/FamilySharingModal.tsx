'use client';

import React, { useState } from 'react';
import { FamilyConfig } from '@/types/place';
import { saveFamilyConfig, PRIMARY_OWNER_EMAIL } from '@/lib/firestore-service';
import { useLanguage } from '@/lib/i18n';
import { X, Users, Heart, Check, Plus, Trash2, ShieldCheck, Mail } from 'lucide-react';

interface FamilySharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FamilyConfig | null;
  currentUserEmail: string | null;
  onSuccessToast: (msg: string) => void;
}

export function FamilySharingModal({
  isOpen,
  onClose,
  config,
  currentUserEmail,
  onSuccessToast,
}: FamilySharingModalProps) {
  const { t, language } = useLanguage();
  const currentWife = config?.wifeEmail || '';
  const initialAdditional = (config?.allowedEmails || []).filter(
    (e) =>
      e.toLowerCase() !== PRIMARY_OWNER_EMAIL.toLowerCase() &&
      (!currentWife || e.toLowerCase() !== currentWife.toLowerCase())
  );

  const [wifeEmail, setWifeEmail] = useState(currentWife);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState<string[]>(initialAdditional);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner =
    currentUserEmail?.toLowerCase() === PRIMARY_OWNER_EMAIL.toLowerCase();

  const handleAddExtraEmail = () => {
    const trimmed = newMemberEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError(t.invalidEmail);
      return;
    }
    if (
      trimmed === PRIMARY_OWNER_EMAIL.toLowerCase() ||
      trimmed === wifeEmail.trim().toLowerCase() ||
      additionalEmails.includes(trimmed)
    ) {
      setError(t.emailAlreadyInList);
      return;
    }

    setAdditionalEmails([...additionalEmails, trimmed]);
    setNewMemberEmail('');
    setError(null);
  };

  const handleRemoveExtraEmail = (emailToRemove: string) => {
    setAdditionalEmails(additionalEmails.filter((e) => e !== emailToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      await saveFamilyConfig(wifeEmail, additionalEmails);
      onSuccessToast(t.toastFamilySaved);
      onClose();
    } catch (err: unknown) {
      let msg = language === 'pt-BR' ? 'Falha ao atualizar lista de acesso.' : 'Failed to update access list.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error?.includes('Missing or insufficient permissions')) {
            msg = language === 'pt-BR'
              ? 'Permissão negada: Certifique-se de estar conectado com o e-mail do proprietário para alterar.'
              : 'Permission denied: Please ensure you are signed in as elsonotake@gmail.com to update family settings.';
          } else {
            msg = parsed.error || err.message;
          }
        } catch {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 border border-slate-200 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto min-w-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.familyTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.familySubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Owner Info Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  {t.ownerBoxTitle}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {PRIMARY_OWNER_EMAIL}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              {t.ownerBadge}
            </span>
          </div>

          {/* Family Member Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{t.memberEmailLabel}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={wifeEmail}
                onChange={(e) => setWifeEmail(e.target.value)}
                placeholder={t.memberEmailPlaceholder}
                disabled={!isOwner}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t.memberEmailHelp}
            </p>
          </div>

          {/* Additional Family Members (Optional) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.otherMembersLabel}</span>
              </label>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder={t.otherMemberPlaceholder}
                  className="flex-1 min-w-0 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddExtraEmail}
                  className="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.addBtn}</span>
                </button>
              </div>
            )}

            {/* List of allowed emails */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t.currentWhitelist}
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-700 font-mono py-0.5">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{PRIMARY_OWNER_EMAIL} ({t.you})</span>
                  </span>
                </div>
                {wifeEmail && (
                  <div className="flex items-center justify-between text-xs text-slate-700 font-mono py-0.5 border-t border-slate-200/60">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>{wifeEmail.toLowerCase()} ({language === 'pt-BR' ? 'Família' : 'Family'})</span>
                    </span>
                  </div>
                )}
                {additionalEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between text-xs text-slate-700 font-mono py-0.5 border-t border-slate-200/60"
                  >
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{email}</span>
                    </span>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraEmail(email)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving || !isOwner}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? t.savingAccessBtn : t.saveAccessBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
