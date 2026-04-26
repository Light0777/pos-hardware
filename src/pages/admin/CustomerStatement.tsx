export default function CustomerStatement({ customer, ledger }: any) {
  const totalDebit = ledger
    .filter((l: any) => l.type === "sale")
    .reduce((sum: number, l: any) => sum + Number(l.amount), 0);

  const totalCredit = ledger
    .filter((l: any) => l.type === "payment")
    .reduce((sum: number, l: any) => sum + Number(l.amount), 0);

  return (
    <div className="p-6 text-sm">
      <h1 className="text-xl font-bold mb-2">Customer Statement</h1>

      <div className="mb-4">
        <div>{customer.name}</div>
        <div>{customer.mobile}</div>
      </div>

      <div className="mb-4">
        <div>Total Sales: ₹{totalDebit}</div>
        <div>Total Payments: ₹{totalCredit}</div>
        <div className="font-bold">
          Balance: ₹{totalDebit - totalCredit}
        </div>
      </div>

      <table className="w-full border text-xs">
        <thead>
          <tr className="border-b">
            <th className="p-2">Date</th>
            <th className="p-2">Type</th>
            <th className="p-2">Note</th>
            <th className="p-2 text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {ledger.map((l: any) => (
            <tr key={l.id} className="border-b">
              <td className="p-2">
                {new Date(l.created_at).toLocaleDateString()}
              </td>
              <td className="p-2">{l.type}</td>
              <td className="p-2">{l.note}</td>
              <td className="p-2 text-right">
                ₹{Number(l.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}