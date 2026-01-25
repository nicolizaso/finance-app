import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReport = (currentUser, transactions) => {
  const doc = new jsPDF();
  const currentDate = new Date();

  // -- STYLES --
  const primaryColor = [16, 185, 129]; // Emerald Green (#10b981)
  const textColor = [40, 40, 40];

  // -- HEADER --
  // Logo placeholder or Title
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Eco', 14, 20);

  // Subheader info
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporte Mensual - ${currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`, 14, 28);
  doc.text(`Generado para: ${currentUser?.username || 'Usuario'}`, 14, 33);
  doc.text(`Fecha: ${currentDate.toLocaleDateString('es-AR')}`, 14, 38);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 42, 196, 42);

  // -- SUMMARY --
  // Calculate totals
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = monthTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncome - totalExpense;

  // Summary Box
  const startY = 50;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Resumen del Mes', 14, startY);

  const summaryData = [
      ['Ingresos Totales', `$ ${totalIncome.toLocaleString('es-AR')}`],
      ['Gastos Totales', `$ ${totalExpense.toLocaleString('es-AR')}`],
      ['Balance Neto', `$ ${balance.toLocaleString('es-AR')}`]
  ];

  autoTable(doc, {
      startY: startY + 5,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 3 },
      columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { halign: 'right' }
      },
      margin: { left: 14, right: 100 } // Keep it compact on the left
  });

  // -- DETAILED TABLE --
  const tableStartY = doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Detalle de Movimientos', 14, tableStartY);

  // Prepare table data
  const tableRows = monthTransactions.map(t => [
      new Date(t.date).toLocaleDateString('es-AR'),
      t.description,
      t.category,
      t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
      `$ ${Number(t.amount).toLocaleString('es-AR')}`
  ]);

  autoTable(doc, {
      startY: tableStartY + 5,
      head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
          0: { cellWidth: 25 },
          4: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
              const rawAmount = monthTransactions[data.row.index].amount;
              const type = monthTransactions[data.row.index].type;
              if (type === 'EXPENSE') {
                  data.cell.styles.textColor = [220, 38, 38]; // Red
              } else {
                  data.cell.styles.textColor = [22, 163, 74]; // Green
              }
          }
      }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
  }

  doc.save(`Reporte_Eco_${currentMonth + 1}_${currentYear}.pdf`);
};
