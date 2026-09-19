import React from "react";

function FarmAction({
  weather,
  cropStage,
  irrigationData,
  pestData,
  fertilizerData
}) {

  const actions = [];

  // Irrigation action
  if (irrigationData) {

    actions.push({
      icon: "💧",
      title: "Irrigation",
      text:
        irrigationData.Irrigation_Advice ||
        irrigationData.Advice ||
        "Check soil moisture and irrigate if required."
    });

  }


  // Pest and disease action
  if (pestData) {

    actions.push({
      icon: "🐛",
      title: "Pest & Disease",
      text:
        pestData.Advice ||
        `Current pest and disease risk is ${pestData.Pest_Disease_Risk}.`
    });

  }


  // Crop stage action
  if (cropStage) {

    actions.push({
      icon: "🌿",
      title: "Crop Stage",
      text:
        cropStage.Stage_Action ||
        `${cropStage.Crop} is currently in the ${cropStage.Crop_Stage} stage.`
    });

  }


  // Fertilizer action
  if (fertilizerData) {

    actions.push({
      icon: "🧪",
      title: "Fertilizer",
      text:
        fertilizerData.Recommendation ||
        "Check the fertilizer recommendation for your crop."
    });

  }


  // Weather action
  if (weather) {

    actions.push({
      icon: "🌤️",
      title: "Weather",
      text:
        `Current temperature is ${weather.Temperature_C}°C with ${weather["Humidity_%"]}% humidity.`
    });

  }


  return (

    <section className="farm-action-section">

      <div className="farm-action-header">

        <div>

          <span className="farm-action-icon">
            🌱
          </span>

          <div>

            <h2>Today's Farm Action</h2>

            <p>
              Important actions based on your current farm conditions.
            </p>

          </div>

        </div>

      </div>


      <div className="farm-action-list">

        {actions.length > 0 ? (

          actions.map((action, index) => (

            <div
              className="farm-action-item"
              key={index}
            >

              <div className="farm-action-item-icon">

                {action.icon}

              </div>


              <div>

                <h3>
                  {action.title}
                </h3>

                <p>
                  {action.text}
                </p>

              </div>

            </div>

          ))

        ) : (

          <div className="farm-action-empty">

            <span>ℹ️</span>

            <p>
              Farm action will appear after your farm information
              is available.
            </p>

          </div>

        )}

      </div>

    </section>

  );

}

export default FarmAction;