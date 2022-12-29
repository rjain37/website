import Project from "@/components/ProjectCard";
import GitHub from "@/components/GitHub";
import PageLayout from "@/layouts/PageLayout";
import useColorMode from "@/hooks/useColorMode";
import colorModes from "@/utils/colorModes";
import Image from "next/image";
import vidnotes from "@/projects/vidnotes.png";
import apsatimsa from "@/projects/aps-at-imsa.png";
import imsagrades from "@/projects/imsagrades.png";

const Projects = () => {
  const { colorMode } = useColorMode();
  const darkMode = colorMode === colorModes.dark;
  return (
    <PageLayout>
      <div className={"mx-auto w-full max-w-prose"}>
        <h1 className={"pt-12 text-4xl font-semibold"}>
          <code>ls /Projects</code>
        </h1>
        <div className="mt-4 space-y-12">
          <Project
            url="https://apsatimsa.org"
            github="aps-at-imsa"
            className={
              "dark:to-purple-100-900 bg-gradient-to-tr from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800"
            }
          >
            <Project.Image src={apsatimsa} />
            <Project.Title>APs@IMSA</Project.Title>
            <Project.Description>
              <p>
                APs@IMSA a project that displays historical AP scores for
                students at the Illinois Mathematics and Science Academy (
                <a href="https://imsa.edu">IMSA</a>). Data for the site was
                obtained through IMSA's Registrar, Reuel Abraham.
              </p>
            </Project.Description>
          </Project>
          <Project
            url="https://imsagrades.com"
            github="phultquist/imsa-grades"
            className={
              "bg-gradient-to-tr from-red-100 to-green-100 dark:from-red-900 dark:to-green-900"
            }
          >
            <Project.Image src={imsagrades} />
            <Project.Title>IMSA Grades</Project.Title>
            <Project.Description>
              <p>
                Like APs@IMSA, IMSA Grades provides noiseless information for
                grade data regarding classes taken at the Illinois Mathematics
                and Science Academy (<a href="https://imsa.edu">IMSA</a>). Data
                for the site was obtained through IMSA's Office of Institutional
                Research (sometimes via FOIA).
              </p>
              <p>
                Inherited from <GitHub>phultquist</GitHub> (love that guy).
              </p>
            </Project.Description>
          </Project>
          {/* <Project
            url="https://imsajhmc.com"
            github="IMSA-JHMC/JHMC-scripts"
            className={
              "bg-gradient-to-tr from-pink-50 to-purple-50 dark:from-pink-800 dark:to-purple-800"
            }
          >
            <Project.Image src={vidnotes} />
            <Project.Title>IMSA JHMC</Project.Title>
            <Project.Description>
              The Junior High Math Contest (JHMC) is a contest ran by IMSA's Mu
              Alpha Theta annually.
            </Project.Description>
          </Project> */}
          <Project
            url="https://rohanja.in/pages/jeopardy.html"
            className={
              "bg-gradient-to-tr from-red-100 to-green-100 dark:from-red-900 dark:to-green-900"
            }
          >
            <Project.Image src={imsagrades} />
            <Project.Title>7th Grade Jeopardy Project</Project.Title>
            <Project.Description>
              This is the first application I ever made and it was for my 7th
              grade history class. Happy to say I got a 100 on this project!
            </Project.Description>
          </Project>
        </div>
      </div>
    </PageLayout>
  );
};
export default Projects;
