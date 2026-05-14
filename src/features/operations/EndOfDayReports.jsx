import React, { useState, useCallback } from 'react'
import { loadEmailJS } from '../../utils/emailjs'
import { EMAILJS } from '../../config/systemConfig'
import { Card, Button, Label, Field, TextArea, Alert, Header } from '../../components/AppPrimitives'

export default function EndOfDayReports({ t, reportArchive = [], onReportArchived }) {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)
  const [formData, setFormData] = useState({
    shift_date: new Date().toISOString().slice(0, 10),
    manager_name: '',
    shift_summary: '',
    complaints: '',
    service_recovery: '',
    staff_issues: '',
    sales_notes: '',
    urgent_items: ''
  })

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  async function sendEndOfDayReport(event) {
    event.preventDefault()
    setStatus(null)
    setSending(true)

    try {
      const emailjs = await loadEmailJS()

      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          shift_date: formData.shift_date,
          manager_name: formData.manager_name,
          shift_summary: formData.shift_summary,
          complaints: formData.complaints,
          service_recovery: formData.service_recovery,
          staff_issues: formData.staff_issues,
          sales_notes: formData.sales_notes,
          urgent_items: formData.urgent_items
        },
        EMAILJS.publicKey
      )

      await onReportArchived?.({ ...formData })
      setStatus({ type: 'success', message: t.ui.reportSent })
      setFormData({
        shift_date: new Date().toISOString().slice(0, 10),
        manager_name: '',
        shift_summary: '',
        complaints: '',
        service_recovery: '',
        staff_issues: '',
        sales_notes: '',
        urgent_items: ''
      })
    } catch (error) {
      console.error('EmailJS failed:', error)
      setStatus({ type: 'error', message: t.ui.reportError })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header eyebrow={t.pages.endOfDay} title={t.pages.endOfDay} body={t.copy.endOfDayBody} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <form onSubmit={sendEndOfDayReport} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="shift_date" label={t.fields.shiftDate} type="date" value={formData.shift_date} onChange={value => updateField('shift_date', value)} />
              <Field id="manager_name" label={t.fields.managerName} value={formData.manager_name} onChange={value => updateField('manager_name', value)} />
            </div>
            <TextArea id="shift_summary" label={t.fields.shiftSummary} value={formData.shift_summary} onChange={value => updateField('shift_summary', value)} />
            <TextArea id="complaints" label={t.fields.complaints} value={formData.complaints} onChange={value => updateField('complaints', value)} />
            <TextArea id="service_recovery" label={t.fields.serviceRecovery} value={formData.service_recovery} onChange={value => updateField('service_recovery', value)} />
            <TextArea id="staff_issues" label={t.fields.staffIssues} value={formData.staff_issues} onChange={value => updateField('staff_issues', value)} />
            <TextArea id="sales_notes" label={t.fields.salesNotes} value={formData.sales_notes} onChange={value => updateField('sales_notes', value)} />
            <TextArea id="urgent_items" label={t.fields.urgentItems} value={formData.urgent_items} onChange={value => updateField('urgent_items', value)} />

            {status && <Alert type={status.type}>{status.message}</Alert>}

            <Button type="submit" disabled={sending}>
              {sending ? t.ui.submitting : t.ui.submitForm}
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
            <Label>Report Archive</Label>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{reportArchive.length}</div>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">Successful EmailJS submissions are preserved locally as shift memory. This is the future database-backed archive.</p>
          </Card>
          <Card>
            <Label>Latest Reports</Label>
            {reportArchive.length ? (
              <div className="space-y-3">
                {reportArchive.slice(0, 5).map(report => (
                  <article key={report.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-[#e8dcc0]">{report.shift_date}</span>
                      <span className="text-xs text-[#e8dcc0]">{report.manager_name || 'Manager'}</span>
                    </div>
                    <p className="line-clamp-3 text-xs leading-6 text-[#e8dcc0]">{report.urgent_items || report.shift_summary || 'Report submitted without urgent items.'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[#e8dcc0]">No submitted reports archived yet.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
