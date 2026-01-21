import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { FileImage, FileText, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

const tools = [
  { title: "PNG to JPG", link: "/png-to-jpg", icon: FileImage, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "JPG to PNG", link: "/jpg-to-png", icon: FileImage, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { title: "PDF to JPG", link: "/pdf-to-jpg", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { title: "JPG to PDF", link: "/jpg-to-pdf", icon: FileText, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "PNG to WebP", link: "/png-to-webp", icon: FileImage, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
  { title: "WebP to PNG", link: "/webp-to-png", icon: FileImage, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-900/20" },
  { title: "WebP to JPG", link: "/webp-to-jpg", icon: FileImage, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { title: "JFIF to JPG", link: "/jfif-to-jpg", icon: FileImage, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
];

export default function AllConverters() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Helmet>
        <title>All Format Converters - Free Online Tools | PixelPress</title>
        <meta name="description" content="Convert between PNG, JPG, WebP, and PDF formats. Free, fast, and private - all processing happens in your browser." />
      </Helmet>
      <Header />

      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
              All Converter <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">Tools</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a specific converter for strict file validation and bulk uploads. 
              All processing happens in your browser.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {tools.map((tool, index) => (
              <Link key={tool.link} href={tool.link}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white dark:bg-slate-900 border border-border/60 rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group flex items-center justify-between"
                  data-testid={`link-converter-${tool.link.slice(1)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg}`}>
                      <tool.icon className={`w-6 h-6 ${tool.color}`} />
                    </div>
                    <span className="font-bold text-lg text-foreground">{tool.title}</span>
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            ))}
          </motion.div>

          <div className="text-center pt-8">
            <Link href="/converter">
              <span className="text-primary hover:underline font-medium cursor-pointer" data-testid="link-general-converter">
                Or use the general converter for any format
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
