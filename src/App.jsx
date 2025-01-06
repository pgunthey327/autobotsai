import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Chatbot from './Chatbot';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import beautify from "js-beautify";

const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI("");
const genModel1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat1 = genModel1.startChat({
  history: [{
    role: "user",
    parts: [{ text: "Hello" }],
  },
  {
    role: "model",
    parts: [{ text: "Great to meet you. What would you like to know?" }],
  }],
});
const genModel2 = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const chat2 = genModel2.startChat({
  history: [{
    role: "user",
    parts: [{ text: "Hello" }],
  },
  {
    role: "model",
    parts: [{ text: "Great to meet you. What would you like to know?" }],
  }],
});

function App() {
  const [model, selectModel] = useState("All");
  const [userMessage, setUserMessage] = useState("");
  const [toggleBot, setToggleBot] = useState(true);
  const [template, setTemplate] = useState("");
  const [messages1, setMessages1] = useState([
    { id: uuidv4(), text: "Hello! How can I help you today?", sender: "bot" }
  ]);

  const [messages2, setMessages2] = useState([
    { id: uuidv4(), text: "Hello! How can I help you today?", sender: "bot" }
  ]);

  
  const [loader1, setLoader1] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [geminiFlash, setGeminiFlash] = useState(true);
  const [geminiPro, setGeminiPro] = useState(true);
  

  const runGemini1Model = async prompt => {
    setLoader1(true);
    const result = await chat1.sendMessage(prompt);
    console.log("response", result);
    setLoader1(false);
    return result.response.text();
}

const runGemini2Model = async prompt => {
  setLoader2(true);
  const result = await chat2.sendMessage(prompt);
  setLoader2(false);
  return result.response.text();
}

    const handleUser1Message = async (userMessage) => {
      setUserMessage("");
      const newUserMessages = [
          ...messages1,
          { id: uuidv4(), text: userMessage, sender: "user" },
      ];
      setMessages1(newUserMessages);
      const botResponse = await runGemini1Model(userMessage);
      const newBotMessages = [
          ...messages1,
          { id: uuidv4(), text: userMessage, sender: "user" },
          { id: uuidv4(), text: botResponse, sender: "bot" }
      ];
      setMessages1(newBotMessages);
    };

    const handleUser2Message = async (userMessage) => {
      setUserMessage("");
      const newUserMessages = [
          ...messages2,
          { id: uuidv4(), text: userMessage, sender: "user" },
      ];
      setMessages2(newUserMessages);
      const botResponse = await runGemini2Model(userMessage);
      const newBotMessages = [
          ...messages2,
          { id: uuidv4(), text: userMessage, sender: "user" },
          { id: uuidv4(), text: botResponse, sender: "bot" }
      ];
      setMessages2(newBotMessages);
    };

    const executeCode = () => {
      const code = document.getElementById("codeEditor");
      const output = document.getElementById("codeOutput");
      try {
          output.innerText = eval(code.value);
      }
      catch(e){
          output.innerText = "Compilation Failed - " + e;
      }
    }

    const saveCode = () => {
      const text = document.getElementById("codeEditor").value;
      var blob = new Blob([text], { type: "javascript" });

      var a = document.createElement('a');
      a.download = "code.js";
      a.href = URL.createObjectURL(blob);
      a.dataset.downloadurl = ["javascript", a.download, a.href].join(':');
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    const generateTemplate = () => {
      const code = document.getElementById("codeEditor");
      try {
          const tem = beautify(template.replace("<code snippet>", `${code.value}`));
            console.log("tem", tem);
            code.value = tem;
      }
      catch(e){
          code.value = "Compilation Failed - " + e;
      }
    }

    const handleFile = (e) => {
      const content = e.target.result;
      setTemplate(content);
    }

    const uploadTemplate = (file) => {
      let fileData = new FileReader();
      fileData.onloadend = handleFile;
      fileData.readAsText(file);
    }

    const copyCode = () => {
      const code = document.getElementById("codeEditor");
      const textArea = document.createElement("textarea");
      textArea.value = code.value;
      document.body.appendChild(textArea);
      
      // Select and copy the content
      textArea.select();
      document.execCommand("copy");
      
      // Remove the temporary text area element
      document.body.removeChild(textArea);
      showToast();
    }

    function showToast() {
      const toast = document.getElementById("toast");
      toast.classList.add("show");
    
      // Hide the toast after 3 seconds
      setTimeout(() => {
          toast.classList.remove("show");
      }, 3000);
    }

    const resetChat = () => {
      if(geminiFlash){
        setMessages1([
          { id: uuidv4(), text: "Hello! How can I help you today?", sender: "bot" }
        ]);
      }
      if(geminiPro){
        setMessages2([
          { id: uuidv4(), text: "Hello! How can I help you today?", sender: "bot" }
        ])
      }
    }

    const resetCode = () => {
      const code = document.getElementById("codeEditor");
      code.value="";
    }

  return (
      <Container style={{height:"100vh"}}>
        <div id="toast" className="toast">Copied to clipboard</div>
        <Row style={{height:"7vh", backgroundColor:"#8004b2"}}>
          <div style={{color: "white", fontFamily: "cursive", fontSize: "large", textAlign: "center", marginTop: "10px"}}>
            Your Code Just A Query Away
          </div>
        </Row>
        <Row style={{height:"93vh", backgroundColor:"#f7e3ff"}}>
          <Col>
          
            <Row style={{height:"88%", padding:"10px", display:toggleBot?"none":"flex"}}>
            <InputGroup className="mb-3" style={{width:"100%", height:"70%"}}>
                     <Form.Control id="codeEditor"
                        style={{width:"100%", height:"100%"}} as="textarea" 
                        placeholder="Enter Code"
                        aria-describedby="basic-addon2"
                      />
            </InputGroup>
            <InputGroup className="mb-3" style={{width:"100%", height:"13%"}}>
            <InputGroup.Text id="basic-addon1" style={{width:"100px"}} >Output</InputGroup.Text>
              <Form.Control
              id="codeOutput" 
              as="textarea"
              style={{width:"400px"}}
              />
            </InputGroup>
            <div style={{justifyContent:"end", display: "inline-flex", width:"100%", height:"40px"}}>
                  <Button style={{marginRight: "7px"}} onClick={()=>executeCode()} >Execute</Button>
                  <Button style={{marginRight: "7px"}} onClick={()=>resetCode()} >Reset</Button>
                  <Form.Group style={{marginRight: "7px"}} controlId="formFile" className="mb-3">
                    <Form.Control onChange={(e)=> uploadTemplate(e.target.files[0])} type="file" />
                  </Form.Group>
                  <div className="tooltip" style={{marginRight: "7px"}}>
                      <span className="tooltiptext" style={{width:"200px"}}>{`Replaces <code snippet> with generated code in template`}</span>
                      <Button disabled={!template} onClick={()=>generateTemplate()} >Generate Template</Button>
                  </div>
                  <Button disabled={!template} style={{marginRight: "7px"}} onClick={()=>copyCode()} >Copy Template</Button>
                  <Button disabled={!template} onClick={()=>saveCode()} >Save Template</Button>
            </div>
            </Row>
         
            <Row style={{height:"88%", padding:"10px", display:toggleBot?"flex":"none"}}>
              {(model==="All" || model==="Gemini 1.5 Flash") && (<Col style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
                <div style={{width:"100%", height:"100%", padding:"10px", backgroundColor:"#b892c6", maxWidth: "520px"}}>
                <div style={{color: "black", fontSize: "x-large", textAlign: "center", marginBottom: "5px", borderBottom:"2px solid grey", display: "inline-flex", width: "100%", justifyContent: "space-between"}}>
                <Form.Check
                  type="switch"
                  id="Gemini 1.5 Flash"
                  label=""
                  onChange={(e)=>setGeminiFlash(e.target.checked)}
                  checked={geminiFlash}
                /> Gemini 1.5 Flash
                </div>
                  <Chatbot messages={messages1} loader={loader1}/>
                  
                </div>
              </Col>)}
              {(model==="All" || model==="Gemini 1.5 Pro") && (<Col style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
              <div style={{width:"100%", height:"100%", padding:"10px", backgroundColor:"#b892c6", maxWidth: "520px"}}>
                <div style={{color: "black", fontSize: "x-large", textAlign: "center", marginBottom: "5px", borderBottom:"2px solid grey", display: "inline-flex", width: "100%", justifyContent: "space-between"}}>   
                <Form.Check
                  type="switch"
                  id="Gemini 1.5 Pro"
                  label=""
                  onChange={(e)=>setGeminiPro(e.target.checked)}
                  checked={geminiPro}
                /> Gemini 1.5 Pro
                  </div>
                <Chatbot messages={messages2} loader={loader2}/>
               
              </div>
              </Col>)}
            </Row>
            <Row style={{height:"10%"}}>
              <InputGroup className="mb-3" style={{marginBottom:"0rem !important"}}>
                  <InputGroup.Text id="basic-addon2">
                    <div className="tooltip" style={{width:"100%"}}>
                      <span className="tooltiptext">{toggleBot? "Generate Template": "Generate Code"}</span>
                      {toggleBot && (<svg onClick={() => setToggleBot(!toggleBot)} style={{width:"20px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#B197FC" d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"/></svg>)}
                      {!toggleBot && (<svg onClick={() => setToggleBot(!toggleBot)} style={{width:"20px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M160 368c26.5 0 48 21.5 48 48l0 16 72.5-54.4c8.3-6.2 18.4-9.6 28.8-9.6L448 368c8.8 0 16-7.2 16-16l0-288c0-8.8-7.2-16-16-16L64 48c-8.8 0-16 7.2-16 16l0 288c0 8.8 7.2 16 16 16l96 0zm48 124l-.2 .2-5.1 3.8-17.1 12.8c-4.8 3.6-11.3 4.2-16.8 1.5s-8.8-8.2-8.8-14.3l0-21.3 0-6.4 0-.3 0-4 0-48-48 0-48 0c-35.3 0-64-28.7-64-64L0 64C0 28.7 28.7 0 64 0L448 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64l-138.7 0L208 492z"/></svg>)}
                    </div>
                  </InputGroup.Text>
                  <InputGroup.Text id="basic-addon2">
                    <div className="tooltip">
                      <span className="tooltiptext">Reset Chat</span>
                      <svg style={{width:"20px"}} onClick={() => resetChat()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#B197FC" d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160 352 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l111.5 0c0 0 0 0 0 0l.4 0c17.7 0 32-14.3 32-32l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1L16 432c0 17.7 14.3 32 32 32s32-14.3 32-32l0-35.1 17.6 17.5c0 0 0 0 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.8c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352l34.4 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L48.4 288c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>
                    </div>
                  </InputGroup.Text>
                  <InputGroup.Text id="basic-addon2" >
                    <Dropdown>
                      <Dropdown.Toggle disabled={!toggleBot} style={{width: "160px"}} variant="primary" id="dropdown-basic">
                        {model}
                      </Dropdown.Toggle>

                      <Dropdown.Menu style={{zIndex:"1080"}}>
                        <Dropdown.Item onClick={e=>{selectModel(e.target.innerText);setGeminiFlash(true);setGeminiPro(true);}}>All</Dropdown.Item>
                        <Dropdown.Item onClick={e=>{selectModel(e.target.innerText);}}>Gemini 1.5 Flash</Dropdown.Item>
                        <Dropdown.Item onClick={e=>{selectModel(e.target.innerText);}}>Gemini 1.5 Pro</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </InputGroup.Text>
                    <Form.Control disabled={!toggleBot} as="textarea" value={userMessage} onChange={e=>setUserMessage(e.target.value)}
                      placeholder="Enter Message"
                      aria-describedby="basic-addon2"
                    />
                  <InputGroup.Text id="basic-addon2">
                    <Button disabled={loader1 || loader2 || !toggleBot} style={{width: "100px"}} variant="primary" onClick={()=>{
                      if(geminiFlash){
                        handleUser1Message(userMessage);
                      }
                      if(geminiPro){
                        handleUser2Message(userMessage);
                      }
                      }}>Send</Button>
                  </InputGroup.Text>
              </InputGroup>

            </Row>
          </Col>
        </Row>
    </Container>
  );
}

export default App;
