import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, Plus, Trash2, Upload, MapPin, User, Briefcase, GraduationCap, Heart, Code, Link as LinkIcon, Calendar, Activity } from 'lucide-react';

interface Edu { id: string; degree: string; institution: string; year: string; result: string; }

interface Biodata {
  photo: string;
  fullName: string; dobAge: string; height: string; bloodGroup: string;
  religionSect: string; maritalStatus: string;
  education: Edu[];
  currentProfession: string; companyName: string; income: string;
  techSkills: string; portfolioLinks: string;
  fatherNameOcc: string; motherNameOcc: string; siblings: string;
  homeDistrict: string; currentResidence: string;
  aboutMyself: string; hobbies: string;
  partnerAgeDiff: string; partnerEducation: string; partnerProfession: string; partnerOther: string;
}

const initialData: Biodata = {
  photo: '',
  fullName: 'Md. Abdullah Al Mahmud',
  dobAge: '15 Aug 1996 (28 Years)',
  height: '5 feet 9 inches',
  bloodGroup: 'B+',
  religionSect: 'Islam (Sunni)',
  maritalStatus: 'Never Married',
  education: [
    { id: '1', degree: 'BSc in Computer Science & Engineering', institution: 'BUET', year: '2019', result: 'CGPA 3.85' },
    { id: '2', degree: 'HSC (Science)', institution: 'Dhaka College', year: '2014', result: 'GPA 5.00' }
  ],
  currentProfession: 'Senior Software Engineer',
  companyName: 'TechNova Solutions (Remote)',
  income: 'Standard IT Scale',
  techSkills: 'React, Node.js, TypeScript, Python, AWS, Docker, System Design',
  portfolioLinks: 'github.com/abdullah-dev, linkedin.com/in/abdullah-dev',
  fatherNameOcc: 'Mr. Abdur Rahman (Retired Govt. Officer)',
  motherNameOcc: 'Mrs. Salma Begum (Homemaker)',
  siblings: '1 Elder Brother (Software Engineer in USA), 1 Younger Sister (Studying MBBS)',
  homeDistrict: 'Comilla',
  currentResidence: 'Dhanmondi, Dhaka',
  aboutMyself: 'I am a tech-enthusiast, logical, and family-oriented person. I balance my professional ambitions with strong family values. In my free time, I contribute to open-source and enjoy traveling.',
  hobbies: 'Coding, Tech Blogging, Photography, Traveling',
  partnerAgeDiff: '22 to 26 years',
  partnerEducation: 'Minimum Graduate (CS/IT or Medical background preferred but not mandatory)',
  partnerProfession: 'Any respectable profession or Homemaker',
  partnerOther: 'Looking for an understanding, religious, and supportive partner who values family.',
};

export default function App() {
  const [data, setData] = useState<Biodata>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsGenerating(true);
      
      // We want to capture the full height of the content, 
      // even if it's clipped in the UI by overflow-hidden.
      // html-to-image is generally more accurate for complex CSS.
      
      const dataUrl = await htmlToImage.toPng(contentRef.current, {
        quality: 1.0,
        pixelRatio: 2, // Higher resolution
        backgroundColor: '#ffffff',
        style: {
          overflow: 'visible', // Ensure we don't clip during capture
          borderRadius: '0', // Remove border radius for the PDF edges
          border: 'none',
          boxShadow: 'none'
        }
      });
      
      // Create a temporary image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      // Create PDF with exact dimensions of the captured image
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'l' : 'p',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_Biodata.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const addEdu = () => setData(p => ({ ...p, education: [...p.education, { id: Date.now().toString(), degree: '', institution: '', year: '', result: '' }] }));
  const updateEdu = (id: string, field: keyof Edu, val: string) => setData(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const removeEdu = (id: string) => setData(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));

  const renderField = (label: string, name: keyof Biodata, placeholder: string, isTextArea = false) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {isTextArea ? (
        <Textarea id={name} name={name} value={data[name] as string} onChange={handleChange} placeholder={placeholder} className="min-h-[80px]" />
      ) : (
        <Input id={name} name={name} value={data[name] as string} onChange={handleChange} placeholder={placeholder} />
      )}
    </div>
  );

  const renderTable = (rows: [string, string][]) => (
    <table className="w-full text-sm mb-6">
      <tbody>
        {rows.filter(r => r[1]).map((row, i) => (
          <tr key={i} className="align-top border-b border-slate-100 last:border-0">
            <td className="py-2 font-semibold w-1/3 text-slate-700">{row[0]}</td>
            <td className="py-2 w-4 text-center text-slate-400">:</td>
            <td className="py-2 pl-2 text-slate-900">{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column: Form */}
        <div className="flex flex-col gap-6 print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Advanced Biodata Builder</h1>
            <p className="text-slate-500 mt-1">Tech-focused, customizable marriage CV generator.</p>
          </div>

          <ScrollArea className="h-[calc(100vh-140px)] pr-4">
            <div className="space-y-6 pb-8">
              
              {/* Photo Upload */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Profile Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                      {data.photo ? <img src={data.photo} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-400" />}
                    </div>
                    <div className="space-y-2">
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" /> Upload Photo
                      </Button>
                      <p className="text-xs text-slate-500">Square image recommended.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card>
                <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Personal Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('Full Name', 'fullName', 'e.g. John Doe')}
                  {renderField('Date of Birth & Age', 'dobAge', 'e.g. 15 Aug 1996 (28 Years)')}
                  {renderField('Height', 'height', 'e.g. 5 feet 8 inches')}
                  {renderField('Blood Group', 'bloodGroup', 'e.g. O+')}
                  {renderField('Religion & Sect', 'religionSect', 'e.g. Islam (Sunni)')}
                  {renderField('Marital Status', 'maritalStatus', 'e.g. Never Married')}
                </CardContent>
              </Card>

              {/* Tech & Profession */}
              <Card>
                <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2"><Code className="w-5 h-5"/> Profession & Tech Profile</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField('Current Profession', 'currentProfession', 'e.g. Software Engineer')}
                  {renderField('Company Name', 'companyName', 'e.g. Google')}
                  {renderField('Income (Optional)', 'income', 'e.g. Standard IT Scale')}
                  {renderField('Portfolio / Links', 'portfolioLinks', 'e.g. github.com/user')}
                  <div className="md:col-span-2">
                    {renderField('Technical Skills', 'techSkills', 'e.g. React, Node.js, Python (Comma separated)', true)}
                  </div>
                </CardContent>
              </Card>

              {/* Education (Dynamic) */}
              <Card>
                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5"/> Education</CardTitle>
                  <Button onClick={addEdu} size="sm" variant="outline" className="gap-1"><Plus className="w-4 h-4"/> Add Degree</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data.education.map((edu, index) => (
                    <div key={edu.id} className="relative p-4 border rounded-lg bg-slate-50/50">
                      <Button onClick={() => removeEdu(edu.id)} variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                        <div className="space-y-1.5">
                          <Label>Degree / Exam</Label>
                          <Input value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="e.g. BSc in CSE" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Institution</Label>
                          <Input value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} placeholder="e.g. BUET" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Passing Year</Label>
                          <Input value={edu.year} onChange={e => updateEdu(edu.id, 'year', e.target.value)} placeholder="e.g. 2019" />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Result (CGPA/GPA)</Label>
                          <Input value={edu.result} onChange={e => updateEdu(edu.id, 'result', e.target.value)} placeholder="e.g. 3.85" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.education.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No education added.</p>}
                </CardContent>
              </Card>

              {/* Family Background */}
              <Card>
                <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5"/> Family Background</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderField("Father's Name & Occ.", 'fatherNameOcc', 'e.g. Mr. Smith (Retired)')}
                  {renderField("Mother's Name & Occ.", 'motherNameOcc', 'e.g. Mrs. Smith (Homemaker)')}
                  <div className="md:col-span-2">{renderField('Siblings', 'siblings', 'e.g. 1 Brother, 1 Sister', true)}</div>
                  {renderField('Home District', 'homeDistrict', 'e.g. Dhaka')}
                  {renderField('Current Residence', 'currentResidence', 'e.g. Dhanmondi, Dhaka')}
                </CardContent>
              </Card>

              {/* Personality & Expectations */}
              <Card>
                <CardHeader className="pb-4"><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5"/> Personality & Expectations</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  {renderField('About Myself', 'aboutMyself', 'Describe yourself...', true)}
                  {renderField('Hobbies', 'hobbies', 'e.g. Coding, Traveling')}
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Partner Age Diff.', 'partnerAgeDiff', 'e.g. 22 to 26 years')}
                    {renderField('Partner Education', 'partnerEducation', 'e.g. Minimum Graduate')}
                    {renderField('Partner Profession', 'partnerProfession', 'e.g. Any respectable profession')}
                    {renderField('Other Qualities', 'partnerOther', 'e.g. Religious, understanding...')}
                  </div>
                </CardContent>
              </Card>

            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Preview */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-semibold text-slate-900">Preview</h2>
            <div className="flex gap-2">
              <Button 
                onClick={downloadPDF} 
                disabled={isGenerating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Printer className="w-4 h-4" /> 
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
              <Button 
                onClick={() => window.print()} 
                variant="outline"
                className="gap-2"
              >
                <Printer className="w-4 h-4" /> Print
              </Button>
            </div>
          </div>

          <Tabs defaultValue="tech" className="w-full">
            <TabsList className="grid w-full grid-cols-3 print:hidden mb-4">
              <TabsTrigger value="tech">Tech Professional</TabsTrigger>
              <TabsTrigger value="modern">Modern Clean</TabsTrigger>
              <TabsTrigger value="traditional">Traditional</TabsTrigger>
            </TabsList>

            <div ref={contentRef} className="bg-white border rounded-xl shadow-sm min-h-[1000px] overflow-hidden print:border-none print:shadow-none print:m-0 print:min-h-0">
              
              {/* Option 1: Royal Elegance */}
              <TabsContent value="tech" className="m-0 h-full print:block">
                <div className="min-h-[1000px] bg-[#FFFBF7] font-serif relative overflow-hidden print:bg-[#FFFBF7]">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-100/50 to-transparent pointer-events-none"></div>
                  
                  {/* Curved Header */}
                  <div className="relative bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 rounded-b-[4rem] shadow-lg print:shadow-none">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent rounded-b-[4rem]"></div>
                    <div className="pt-12 pb-28 px-8 text-center relative z-10">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-wide font-serif">{data.fullName}</h1>
                      <p className="text-teal-200 text-lg italic font-sans">{data.currentProfession} at {data.companyName}</p>
                    </div>
                  </div>

                  {/* Profile Photo - Overlapping */}
                  <div className="relative -mt-20 flex justify-center z-20">
                    <div className="p-2 bg-[#FFFBF7] rounded-full shadow-xl">
                      {data.photo ? (
                        <img src={data.photo} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-teal-100" />
                      ) : (
                        <div className="w-40 h-40 rounded-full bg-teal-50 border-4 border-teal-100 flex items-center justify-center">
                          <User className="w-12 h-12 text-teal-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="max-w-4xl mx-auto px-8 pb-16 pt-8">
                    
                    {/* Quick Info Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12 font-sans">
                      <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-sm border border-teal-100 shadow-sm flex items-center gap-1"><Calendar className="w-4 h-4"/> {data.dobAge}</span>
                      <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-sm border border-teal-100 shadow-sm flex items-center gap-1"><MapPin className="w-4 h-4"/> {data.currentResidence}</span>
                      <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-sm border border-teal-100 shadow-sm flex items-center gap-1"><Heart className="w-4 h-4"/> {data.maritalStatus}</span>
                      <span className="bg-teal-50 text-teal-800 px-4 py-1.5 rounded-full text-sm border border-teal-100 shadow-sm flex items-center gap-1"><User className="w-4 h-4"/> {data.height} • {data.bloodGroup}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      
                      {/* Left Column */}
                      <div className="space-y-10">
                        {/* About Me */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-teal-50 relative">
                          <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><Heart className="w-5 h-5 text-teal-600"/></div>
                          <h2 className="text-2xl font-bold text-teal-900 mb-4 ml-4">About Me</h2>
                          <p className="text-slate-700 leading-relaxed font-sans">{data.aboutMyself}</p>
                          <div className="mt-4 pt-4 border-t border-teal-50">
                            <strong className="text-teal-900 block mb-1">Hobbies & Interests:</strong>
                            <p className="text-slate-700 font-sans">{data.hobbies}</p>
                          </div>
                        </section>

                        {/* Tech & Profession */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-teal-50 relative">
                          <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><Code className="w-5 h-5 text-teal-600"/></div>
                          <h2 className="text-2xl font-bold text-teal-900 mb-4 ml-4">Professional Profile</h2>
                          <div className="space-y-3 font-sans text-sm">
                            <p><strong className="text-slate-900">Profession:</strong> <span className="text-slate-700">{data.currentProfession}</span></p>
                            <p><strong className="text-slate-900">Company:</strong> <span className="text-slate-700">{data.companyName}</span></p>
                            {data.income && <p><strong className="text-slate-900">Income:</strong> <span className="text-slate-700">{data.income}</span></p>}
                            {data.portfolioLinks && <p><strong className="text-slate-900">Portfolio:</strong> <span className="text-slate-700">{data.portfolioLinks}</span></p>}
                            
                            {data.techSkills && (
                              <div className="mt-4 pt-4 border-t border-teal-50">
                                <strong className="text-teal-900 block mb-2 font-serif text-lg">Technical Arsenal</strong>
                                <div className="flex flex-wrap gap-2">
                                  {data.techSkills.split(',').map((skill, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">{skill.trim()}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </section>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-10">
                        {/* Education */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-teal-50 relative">
                          <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><GraduationCap className="w-5 h-5 text-teal-600"/></div>
                          <h2 className="text-2xl font-bold text-teal-900 mb-4 ml-4">Education</h2>
                          <div className="space-y-5 font-sans">
                            {data.education.map((edu, i) => (
                              <div key={i} className="relative pl-6 border-l-2 border-teal-200">
                                <div className="absolute w-3 h-3 bg-teal-400 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                                <h3 className="font-bold text-slate-900 text-base">{edu.degree}</h3>
                                <p className="text-slate-600 text-sm">{edu.institution} • {edu.year}</p>
                                {edu.result && <p className="text-teal-600 font-medium text-sm mt-0.5">{edu.result}</p>}
                              </div>
                            ))}
                          </div>
                        </section>

                        {/* Family */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-teal-50 relative">
                          <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-teal-600"/></div>
                          <h2 className="text-2xl font-bold text-teal-900 mb-4 ml-4">Family Background</h2>
                          <div className="space-y-3 font-sans text-sm">
                            <p><strong className="text-slate-900 block">Father</strong> <span className="text-slate-700">{data.fatherNameOcc}</span></p>
                            <p><strong className="text-slate-900 block">Mother</strong> <span className="text-slate-700">{data.motherNameOcc}</span></p>
                            <p><strong className="text-slate-900 block">Siblings</strong> <span className="text-slate-700">{data.siblings}</span></p>
                            <p><strong className="text-slate-900 block">Home District</strong> <span className="text-slate-700">{data.homeDistrict}</span></p>
                          </div>
                        </section>

                        {/* Partner Preferences */}
                        <section className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 rounded-3xl shadow-sm border border-teal-100 relative">
                          <div className="absolute -top-4 -left-4 w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center"><Heart className="w-5 h-5 text-teal-700"/></div>
                          <h2 className="text-2xl font-bold text-teal-900 mb-4 ml-4">Partner Preferences</h2>
                          <ul className="space-y-3 font-sans text-sm text-slate-800">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></div> <div><strong>Age:</strong> {data.partnerAgeDiff}</div></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></div> <div><strong>Education:</strong> {data.partnerEducation}</div></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></div> <div><strong>Profession:</strong> {data.partnerProfession}</div></li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></div> <div><strong>Qualities:</strong> {data.partnerOther}</div></li>
                          </ul>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Option 2: Soft Romance */}
              <TabsContent value="modern" className="p-0 m-0 print:block">
                <div className="min-h-[1000px] bg-pink-50/50 font-sans p-8 print:p-0 print:bg-white">
                  <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl print:shadow-none print:rounded-none overflow-hidden border border-pink-100">
                    
                    {/* Header Section */}
                    <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-white p-12 text-center relative">
                      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                        <div className="absolute top-10 -right-10 w-40 h-40 bg-rose-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
                      </div>
                      
                      {data.photo && (
                        <img src={data.photo} alt="Profile" className="w-32 h-32 mx-auto rounded-[2rem] object-cover shadow-lg border-4 border-white mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 relative z-10" />
                      )}
                      <h1 className="text-5xl font-bold text-slate-800 mb-2 relative z-10 font-cursive">{data.fullName}</h1>
                      <p className="text-pink-600 font-medium tracking-wide uppercase text-sm relative z-10">{data.currentProfession}</p>
                    </div>

                    <div className="p-10 space-y-10">
                      {/* Grid 1: Personal & Family */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100/50">
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-pink-500"/> Personal Details</h3>
                          <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex justify-between border-b border-pink-100 pb-1"><span>Age</span> <strong className="text-slate-800">{data.dobAge}</strong></li>
                            <li className="flex justify-between border-b border-pink-100 pb-1"><span>Height</span> <strong className="text-slate-800">{data.height}</strong></li>
                            <li className="flex justify-between border-b border-pink-100 pb-1"><span>Blood Group</span> <strong className="text-slate-800">{data.bloodGroup}</strong></li>
                            <li className="flex justify-between border-b border-pink-100 pb-1"><span>Religion</span> <strong className="text-slate-800">{data.religionSect}</strong></li>
                            <li className="flex justify-between border-b border-pink-100 pb-1"><span>Marital Status</span> <strong className="text-slate-800">{data.maritalStatus}</strong></li>
                            <li className="flex justify-between pt-1"><span>Residence</span> <strong className="text-slate-800 text-right max-w-[60%]">{data.currentResidence}</strong></li>
                          </ul>
                        </div>

                        <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100/50">
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500"/> Family Background</h3>
                          <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex flex-col border-b border-pink-100 pb-2"><span>Father</span> <strong className="text-slate-800">{data.fatherNameOcc}</strong></li>
                            <li className="flex flex-col border-b border-pink-100 pb-2"><span>Mother</span> <strong className="text-slate-800">{data.motherNameOcc}</strong></li>
                            <li className="flex flex-col border-b border-pink-100 pb-2"><span>Siblings</span> <strong className="text-slate-800">{data.siblings}</strong></li>
                            <li className="flex flex-col pt-1"><span>Home District</span> <strong className="text-slate-800">{data.homeDistrict}</strong></li>
                          </ul>
                        </div>
                      </div>

                      {/* Grid 2: Education & Tech */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-pink-500"/> Education</h3>
                          <div className="space-y-4">
                            {data.education.map((edu, i) => (
                              <div key={i} className="text-sm">
                                <strong className="text-slate-800 block text-base">{edu.degree}</strong>
                                <span className="text-slate-500">{edu.institution} ({edu.year})</span>
                                {edu.result && <span className="block text-pink-600 font-medium mt-0.5">{edu.result}</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Code className="w-5 h-5 text-pink-500"/> Tech & Career</h3>
                          <div className="space-y-3 text-sm text-slate-600">
                            <p><strong className="text-slate-800">Company:</strong> {data.companyName}</p>
                            {data.income && <p><strong className="text-slate-800">Income:</strong> {data.income}</p>}
                            {data.portfolioLinks && <p><strong className="text-slate-800">Links:</strong> <span className="text-pink-600">{data.portfolioLinks}</span></p>}
                            {data.techSkills && (
                              <div className="pt-2">
                                <strong className="text-slate-800 block mb-2">Skills:</strong>
                                <div className="flex flex-wrap gap-1.5">
                                  {data.techSkills.split(',').map((skill, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs">{skill.trim()}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* About & Partner */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-8 rounded-3xl border border-pink-100">
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-slate-800 mb-2">About Me</h3>
                          <p className="text-slate-600 text-sm leading-relaxed">{data.aboutMyself}</p>
                          <p className="text-slate-600 text-sm mt-2"><strong className="text-slate-800">Hobbies:</strong> {data.hobbies}</p>
                        </div>
                        <Separator className="my-6 bg-pink-200" />
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 mb-4">Partner Preferences</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                            <div><strong className="text-slate-800 block">Age Difference</strong> {data.partnerAgeDiff}</div>
                            <div><strong className="text-slate-800 block">Education</strong> {data.partnerEducation}</div>
                            <div><strong className="text-slate-800 block">Profession</strong> {data.partnerProfession}</div>
                            <div><strong className="text-slate-800 block">Other Qualities</strong> {data.partnerOther}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Option 3: Artistic Glass */}
              <TabsContent value="traditional" className="p-0 m-0 print:block">
                <div className="min-h-[1000px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 font-sans print:p-0 print:bg-white relative z-0">
                  {/* Abstract Background Shapes */}
                  <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none z-[-1]"></div>
                  <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none z-[-1]"></div>
                  <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none z-[-1]"></div>

                  <div className="max-w-4xl mx-auto">
                    {/* Header Glass Card */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] mb-8 flex flex-col md:flex-row items-center gap-8 print:shadow-none print:border-slate-200">
                      {data.photo && (
                        <div className="shrink-0 p-1.5 bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 rounded-full">
                          <img src={data.photo} alt="Profile" className="w-36 h-36 rounded-full object-cover border-4 border-white" />
                        </div>
                      )}
                      <div className="text-center md:text-left">
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-2 font-serif">{data.fullName}</h1>
                        <p className="text-lg font-medium text-slate-700">{data.currentProfession}</p>
                        <p className="text-slate-500">{data.companyName}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                          <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 border border-indigo-100">{data.dobAge}</span>
                          <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 border border-purple-100">{data.religionSect}</span>
                          <span className="bg-white/80 px-3 py-1 rounded-full text-xs font-semibold text-pink-700 border border-pink-100">{data.maritalStatus}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Column */}
                      <div className="md:col-span-1 space-y-8">
                        {/* Personal Info */}
                        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] print:shadow-none print:border-slate-200">
                          <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-4">Details</h3>
                          <ul className="space-y-3 text-sm text-slate-700">
                            <li><strong>Height:</strong> {data.height}</li>
                            <li><strong>Blood Group:</strong> {data.bloodGroup}</li>
                            <li><strong>Residence:</strong> {data.currentResidence}</li>
                            <li><strong>Home Dist:</strong> {data.homeDistrict}</li>
                          </ul>
                        </div>

                        {/* Tech Stack */}
                        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] print:shadow-none print:border-slate-200">
                          <h3 className="text-sm font-bold text-purple-800 uppercase tracking-widest mb-4">Tech Arsenal</h3>
                          <div className="flex flex-wrap gap-2">
                            {data.techSkills.split(',').map((skill, i) => (
                              <span key={i} className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 px-2.5 py-1 rounded-xl text-xs font-medium border border-indigo-100/50">{skill.trim()}</span>
                            ))}
                          </div>
                          {data.portfolioLinks && (
                            <div className="mt-4 pt-4 border-t border-white/50 text-xs text-slate-600 break-all">
                              <strong>Links:</strong><br/>{data.portfolioLinks}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="md:col-span-2 space-y-8">
                        {/* Education & Family */}
                        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] print:shadow-none print:border-slate-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                              <h3 className="text-sm font-bold text-pink-800 uppercase tracking-widest mb-4">Education</h3>
                              <div className="space-y-4">
                                {data.education.map((edu, i) => (
                                  <div key={i} className="text-sm">
                                    <strong className="text-slate-800 block">{edu.degree}</strong>
                                    <span className="text-slate-600">{edu.institution}</span>
                                    <span className="text-slate-500 block text-xs mt-0.5">{edu.year} {edu.result ? `• ${edu.result}` : ''}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-pink-800 uppercase tracking-widest mb-4">Family</h3>
                              <div className="space-y-3 text-sm text-slate-700">
                                <p><strong>Father:</strong><br/>{data.fatherNameOcc}</p>
                                <p><strong>Mother:</strong><br/>{data.motherNameOcc}</p>
                                <p><strong>Siblings:</strong><br/>{data.siblings}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* About & Expectations */}
                        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] print:shadow-none print:border-slate-200">
                          <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-widest mb-3">About Me</h3>
                          <p className="text-sm text-slate-700 leading-relaxed mb-4">{data.aboutMyself}</p>
                          <p className="text-sm text-slate-700 mb-6"><strong>Hobbies:</strong> {data.hobbies}</p>

                          <h3 className="text-sm font-bold text-purple-800 uppercase tracking-widest mb-3">Looking For</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 bg-white/40 p-4 rounded-2xl">
                            <p><strong>Age:</strong> {data.partnerAgeDiff}</p>
                            <p><strong>Education:</strong> {data.partnerEducation}</p>
                            <p><strong>Profession:</strong> {data.partnerProfession}</p>
                            <p><strong>Qualities:</strong> {data.partnerOther}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
