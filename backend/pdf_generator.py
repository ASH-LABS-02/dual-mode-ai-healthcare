from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib.units import inch
from datetime import datetime
import io

def generate_report_pdf(report_data: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = styles['Title']
    story.append(Paragraph("Medical Report Analysis", title_style))
    story.append(Spacer(1, 0.2 * inch))

    # Metadata
    normal_style = styles['Normal']
    dt = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    story.append(Paragraph(f"Generated on: {dt}", normal_style))
    
    report_type = report_data.get('extraction', {}).get('report_type', 'Unknown')
    story.append(Paragraph(f"Report Type: {report_type}", normal_style))
    story.append(Spacer(1, 0.2 * inch))

    # Red Flags
    red_flags = report_data.get('red_flags', [])
    if red_flags:
        story.append(Paragraph("<b>RED FLAGS DETECTED:</b>", styles['Heading3']))
        for flag in red_flags:
            story.append(Paragraph(f"<font color='red'>• {flag}</font>", normal_style))
        story.append(Spacer(1, 0.2 * inch))

    # Determine which analysis to show (Patient or Clinician)
    # The API might return both, but usually we want to show what was presented. 
    # For now, let's include Patient Analysis if available, then Clinician.
    
    patient_analysis = report_data.get('patient_analysis')
    clinician_analysis = report_data.get('clinician_analysis')

    if patient_analysis:
        story.append(Paragraph("Patient Explanation", styles['Heading2']))
        
        # Summary
        story.append(Paragraph("<b>Summary:</b>", styles['Heading3']))
        story.append(Paragraph(patient_analysis.get('summary', ''), normal_style))
        story.append(Spacer(1, 0.1 * inch))
        
        # Key Points
        story.append(Paragraph("<b>Key Points:</b>", styles['Heading3']))
        key_points = patient_analysis.get('key_points', [])
        kp_items = [ListItem(Paragraph(kp, normal_style)) for kp in key_points]
        story.append(ListFlowable(kp_items, bulletType='bullet', start='•'))
        story.append(Spacer(1, 0.1 * inch))

        # What This Means
        story.append(Paragraph("<b>What This Means:</b>", styles['Heading3']))
        means = patient_analysis.get('what_this_means', [])
        means_items = [ListItem(Paragraph(m, normal_style)) for m in means]
        story.append(ListFlowable(means_items, bulletType='bullet', start='•'))
        story.append(Spacer(1, 0.1 * inch))

        # Questions
        story.append(Paragraph("<b>Questions to Ask:</b>", styles['Heading3']))
        qs = patient_analysis.get('questions_to_ask', [])
        qs_items = [ListItem(Paragraph(q, normal_style)) for q in qs]
        story.append(ListFlowable(qs_items, bulletType='bullet', start='•'))
        story.append(Spacer(1, 0.2 * inch))

    if clinician_analysis:
        story.append(Paragraph("Clinician Summary", styles['Heading2']))
        
        # Impression
        story.append(Paragraph("<b>Impression:</b>", styles['Heading3']))
        story.append(Paragraph(clinician_analysis.get('impression', ''), normal_style))
        story.append(Spacer(1, 0.1 * inch))

        # Findings
        story.append(Paragraph("<b>Findings:</b>", styles['Heading3']))
        findings = clinician_analysis.get('findings_bullet_points', [])
        f_items = [ListItem(Paragraph(f, normal_style)) for f in findings]
        story.append(ListFlowable(f_items, bulletType='bullet', start='•'))
        story.append(Spacer(1, 0.1 * inch))

        # Recs
        story.append(Paragraph("<b>Recommendations:</b>", styles['Heading3']))
        recs = clinician_analysis.get('recommendations', [])
        r_items = [ListItem(Paragraph(r, normal_style)) for r in recs]
        story.append(ListFlowable(r_items, bulletType='bullet', start='•'))
        story.append(Spacer(1, 0.2 * inch))

    # Labs
    labs = report_data.get('extraction', {}).get('labs', [])
    if labs:
        story.append(Paragraph("Lab Results", styles['Heading2']))
        # Table Header
        data = [['Name', 'Value', 'Unit', 'Flag']]
        for lab in labs:
            data.append([
                lab.get('name', ''),
                str(lab.get('value', '')),
                lab.get('unit', '') or '',
                lab.get('flag', '') or ''
            ])
        
        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(t)
        story.append(Spacer(1, 0.2 * inch))

    # Disclaimer
    story.append(Spacer(1, 0.5 * inch))
    disclaimer_style = ParagraphStyle('Disclaimer', parent=normal_style, fontSize=8, textColor=colors.grey)
    story.append(Paragraph("DISCLAIMER: This is an AI-generated analysis. It is not a substitute for professional medical advice. Always consult with a qualified healthcare provider.", disclaimer_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
