import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ReceiptDocument from "../components/receipts/ReceiptDocument";
import {receiptService} from "../services/receiptService";


function ReceiptPreview() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [receipt, setReceipt] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);


  /* =====================================================
     LOAD RECEIPT
  ===================================================== */

  useEffect(() => {
    const loadReceipt =
      async () => {
        try {
          setLoading(true);

          const data =
            await receiptService.getById(
              id
            );

          setReceipt(data);

        } catch (err) {
          console.error(
            "Receipt preview error:",
            err
          );

          setError(
            err?.response?.data?.detail ||
            "Unable to load receipt."
          );
        } finally {
          setLoading(false);
        }
      };


    loadReceipt();
  }, [id]);


  /* =====================================================
     DOWNLOAD
  ===================================================== */

  const handleDownload =
    async () => {
      if (!receipt) return;

      try {
        setDownloading(true);


        const wrapper =
          document.createElement(
            "div"
          );

        wrapper.style.position =
          "fixed";

        wrapper.style.left =
          "-10000px";

        wrapper.style.top = "0";

        wrapper.style.width =
          "794px";

        wrapper.style.height =
          "1123px";

        wrapper.style.background =
          "#ffffff";


        document.body.appendChild(
          wrapper
        );


        const root =
          createRoot(wrapper);


        root.render(
          <ReceiptDocument
            receipt={receipt}
          />
        );


        await new Promise(
          (resolve) =>
            requestAnimationFrame(
              () =>
                requestAnimationFrame(
                  resolve
                )
            )
        );


        const element =
          wrapper.firstElementChild;


        const canvas =
          await html2canvas(
            element,
            {
              width: 794,
              height: 1123,
              scale: 3,
              backgroundColor:
                "#ffffff",
              useCORS: true,
              logging: false,
            }
          );


        const pdf =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
          });


        pdf.addImage(
          canvas.toDataURL(
            "image/png",
            1
          ),
          "PNG",
          0,
          0,
          210,
          297,
          undefined,
          "FAST"
        );


        pdf.save(
          `${receipt.receipt_number}.pdf`
        );


        root.unmount();
        wrapper.remove();

      } catch (err) {
        console.error(
          "PDF download error:",
          err
        );

        setError(
          "Unable to create PDF."
        );
      } finally {
        setDownloading(false);
      }
    };


  return (
    <div className="min-h-screen bg-[#f7f7f5]">

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />


      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen
            ? "ml-0 md:ml-64"
            : "ml-0 md:ml-20"
        }`}
      >

        <Header />


        <main className="px-4 py-4 sm:px-6 lg:px-8">

          {/* HEADER */}

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <button
                onClick={() =>
                  navigate(
                    "/receipts"
                  )
                }
                className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                <ArrowLeft
                  size={15}
                />

                Back to receipts

              </button>


              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f9e9e4] text-[#b9563e]">
                  <FileText
                    size={17}
                  />
                </div>


                <div>

                  <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                    Receipt preview
                  </h1>

                  {receipt && (
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {
                        receipt.receipt_number
                      }
                    </p>
                  )}

                </div>

              </div>

            </div>


            <button
              onClick={
                handleDownload
              }
              disabled={
                !receipt ||
                downloading
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#b9563e] px-4 text-sm font-semibold text-white transition hover:bg-[#a94d37] disabled:opacity-50"
            >

              {downloading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Preparing PDF...
                </>
              ) : (
                <>
                  <Download
                    size={16}
                  />

                  Download PDF
                </>
              )}

            </button>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          {/* PREVIEW */}

          <div className="flex justify-center overflow-auto rounded-2xl border border-neutral-200 bg-neutral-100 p-3 shadow-sm sm:p-6">

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center">

                <div className="text-center">

                  <Loader2
                    size={25}
                    className="mx-auto animate-spin text-[#b9563e]"
                  />

                  <p className="mt-3 text-sm text-neutral-500">
                    Loading receipt...
                  </p>

                </div>

              </div>
            ) : receipt ? (
              <div className="origin-top scale-[0.45] shadow-2xl sm:scale-[0.65] lg:scale-[0.8] xl:scale-100">

                <ReceiptDocument
                  receipt={receipt}
                />

              </div>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center text-sm text-neutral-400">
                Receipt not found.
              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}


export default ReceiptPreview;