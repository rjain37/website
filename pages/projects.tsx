import Project from "@/components/ProjectCard";
import GitHub from "@/components/GitHub";
import PageLayout from "@/layouts/PageLayout";
import useColorMode from "@/hooks/useColorMode";
import colorModes from "@/utils/colorModes";
import Image from "next/image";
import apsatimsa from "@/projects/aps-at-imsa.png";
import imsagrades from "@/projects/imsagrades.png";
import jeopardy from "@/projects/jeopardy.png";
import tablegeneration from "@/projects/table-generator.png";

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
            url="https://rjain37.github.io/ssp-table-generation/"
            github="ssp-table-generation"
            className={
              "dark:to-blue-100-900 bg-gradient-to-tr from-orange-100 to-blue-300 dark:from-orange-600 dark:to-blue-800"
            }
          >
            <Project.Image src={tablegeneration} />
            <Project.Title>SSP Table Generator</Project.Title>
            <Project.Description>
              <p>
                The SSP Table Generator is a tool that allows TAs at the Summer
                Science Program (SSP) to generate dinner tables for the 5.5 
                weeks of camp. The tool uses roommate pairings, research groups,
                and sex as the primary parameters for generating tables.
              </p>
              <p>
                Made in collaboration with my wondeful friends Oliver Lin, Gabriele 
                Di Gianluca, and Nico von Eckartsberg.
              </p>
            </Project.Description>
          </Project>
          <Project
            url="https://apsatimsa.org"
            github="aps-at-imsa"
            className={
              "dark:to-green-100-900 bg-gradient-to-tr from-blue-100 to-green-300 dark:from-blue-600 dark:to-green-800"
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
              "bg-gradient-to-tr from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900"
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
              "bg-gradient-to-tr from-yellow-100 to-blue-100 dark:from-yellow-600 dark:to-blue-600"
            }
          >
            <Project.Image src={jeopardy} />
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
