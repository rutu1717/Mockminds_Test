import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Award,
  Calendar,
  Clock,
  User,
  Zap,
  MessageSquare,
  TrendingUp,
  Brain,
  Users,
  Lightbulb,
} from "lucide-react";
const skillsData = [
  { skill: "JavaScript", percentage: 80 },
  { skill: "React", percentage: 70 },
  { skill: "TypeScript", percentage: 65 },
];

const traitsData = [
  { trait: "Openness", percentage: 85 },
  { trait: "Conscientiousness", percentage: 75 },
  { trait: "Agreeableness", percentage: 90 },
];

const ProgressBar = ({
  label,
  percentage,
}: {
  label: string;
  percentage: number;
}) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-gray-100">{label}</span>
      <span className="text-gray-400">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-gray-700 rounded-md overflow-hidden">
      <div
        className="h-full bg-purple-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const SkillCard = ({
  skill,
}: {
  skill: { skill: string; percentage: number };
}) => (
  <div className="bg-gray-800 border border-gray-700 p-4 rounded-md shadow">
    <ProgressBar label={skill.skill} percentage={skill.percentage} />
  </div>
);

const TraitCard = ({
  trait,
}: {
  trait: { trait: string; percentage: number };
}) => (
  <div className="bg-gray-800 border border-gray-700 p-4 rounded-md shadow">
    <ProgressBar label={trait.trait} percentage={trait.percentage} />
  </div>
);

const interviewData = {
  candidateName: "Ruturaj Kadam",
  overallScore: 85,
  interviewDate: "2023-10-20",
  duration: "45 minutes",
  skills: [
    { name: "Communication", score: 90 },
    { name: "Technical Knowledge", score: 85 },
    { name: "Problem Solving", score: 80 },
    { name: "Creativity", score: 75 },
    { name: "Teamwork", score: 95 },
  ],
  aiComments: [
    "Demonstrated strong communication skills throughout the interview.",
    "Showed good understanding of fundamental concepts in software development.",
    "Could improve on problem-solving speed for complex algorithmic questions.",
    "Excellent team player with great collaborative mindset.",
  ],
  recommendations: [
    "Practice more complex algorithmic problems to improve problem-solving speed.",
    "Deepen knowledge in system design concepts.",
    "Continue to leverage strong communication and teamwork skills in future roles.",
  ],
};

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const CircularChart = ({ value = 120, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className="text-gray-800"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-indigo-500"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="text-2xl font-bold fill-gray-100"
      >
        {value}%
      </text>
    </svg>
  );
};

export default function InterviewDashboard() {
  return (
    <div className="min-h-screen bg-black py-8 text-gray-100">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            AI Interview Report
          </h1>
          <p className="text-xl text-gray-300">
            Performance Analysis & Insights
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold text-gray-100">
                Candidate Info
              </CardTitle>
              <User className="h-6 w-6 text-indigo-400" />
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {interviewData.candidateName}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{interviewData.interviewDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{interviewData.duration}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center">
                <span className="text-sm font-medium mb-2 text-gray-300">
                  Overall Score
                </span>
                <CircularChart
                  value={interviewData.overallScore}
                  size={150}
                  strokeWidth={10}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-gray-100">
                <Award className="h-6 w-6 mr-2 text-yellow-500" />
                Key Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-around">
              {interviewData.skills.slice(0, 3).map((skill, index) => (
                <div
                  key={skill.name}
                  className="flex flex-col items-center mb-4"
                >
                  <CircularChart
                    value={skill.score}
                    size={100}
                    strokeWidth={8}
                  />
                  <span className="mt-2 text-sm font-medium text-gray-300">
                    {skill.name}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-gray-100">
                <Brain className="h-6 w-6 mr-2 text-purple-400" />
                Skill Breakdown
              </CardTitle>
            </CardHeader>
            <div className="mt-4">
              {skillsData.map((skill) => (
                <SkillCard key={skill.skill} skill={skill} />
              ))}
            </div>
          </Card>

          <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-gray-100">
                <Users className="h-6 w-6 mr-2 text-green-400" />
                Personality Traits
              </CardTitle>
            </CardHeader>
            <div className="mt-4">
              {traitsData.map((trait) => (
                <TraitCard key={trait.trait} trait={trait} />
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-gray-100">
                <MessageSquare className="h-6 w-6 mr-2 text-blue-400" />
                AI Agent Feedback
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comments and observations from the AI interviewer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <ul className="space-y-4">
                  {interviewData.aiComments.map((comment, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 bg-gray-800 p-3 rounded-lg"
                    >
                      <Badge className="mt-0.5 shrink-0 bg-blue-900 text-blue-200">
                        AI
                      </Badge>

                      <span className="text-gray-200">{comment}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-gray-100">
                <Lightbulb className="h-6 w-6 mr-2 text-yellow-400" />
                Recommendations
              </CardTitle>
              <CardDescription className="text-gray-400">
                Areas for improvement and next steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {interviewData.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-gray-200"
                  >
                    <Zap className="h-5 w-5 mt-0.5 text-purple-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
